/**
 * Convierte JMdict (formato jmdict-simplified) a data/jmdict.db.
 * Se corre una sola vez. Cero red: el JSON lo descargás vos a mano.
 *
 *   npm run build:jmdict                        # lee data/raw/jmdict-eng.json
 *   npm run build:jmdict -- ruta/al/archivo.json
 *
 * Descarga (una vez, a mano):
 *   https://github.com/scriptin/jmdict-simplified/releases
 *   archivo jmdict-eng-<version>.json  ->  data/raw/jmdict-eng.json  (obligatorio)
 *
 *   Opcional, para glosas en español sin depender de IA:
 *   archivo jmdict-spa-<version>.json  ->  data/raw/jmdict-spa.json
 *   Si no está, la app sigue andando igual — el miner usa IA (cacheada) como
 *   respaldo solo para las palabras que el español de JMdict no cubre
 *   (~39.000 entradas, bastante menos que las ~190.000 del inglés).
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { normalizeLemma, katakanaToHiragana } from '../lib/normalize.ts';

const MAX_GLOSSES = 4;

type JmdictKanji = { text: string; common?: boolean };
type JmdictKana = { text: string; common?: boolean; appliesToKanji?: string[] };
type JmdictSense = {
  partOfSpeech?: string[];
  gloss?: { lang?: string; text: string }[];
};
type JmdictWord = {
  id: string;
  kanji?: JmdictKanji[];
  kana?: JmdictKana[];
  sense?: JmdictSense[];
};

const DATA_DIR = path.join(process.cwd(), 'data');
const OUT_PATH = path.join(DATA_DIR, 'jmdict.db');
const DEFAULT_IN = path.join(DATA_DIR, 'raw', 'jmdict-eng.json');
const DEFAULT_IN_ES = path.join(DATA_DIR, 'raw', 'jmdict-spa.json');

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function readSource(file: string): JmdictWord[] & { __meta?: unknown } {
  if (!fs.existsSync(file)) {
    fail(
      `No encontré ${file}\n\n` +
        `Descargalo una vez desde:\n` +
        `  https://github.com/scriptin/jmdict-simplified/releases\n` +
        `Tomá el archivo jmdict-eng-<version>.json y guardalo como:\n` +
        `  ${DEFAULT_IN}\n\n` +
        `Mientras tanto la app funciona igual, solo sin lectura ni significado.`,
    );
  }
  return parseSource(file);
}

/** Igual que readSource pero sin morir si falta — se usa para el español,
 *  que es opcional (la app cae a IA para lo que no cubra). */
function readSourceOptional(file: string): JmdictWord[] | null {
  if (!fs.existsSync(file)) return null;
  return parseSource(file);
}

function parseSource(file: string): JmdictWord[] & { __meta?: unknown } {
  const buf = file.endsWith('.gz')
    ? zlib.gunzipSync(fs.readFileSync(file))
    : fs.readFileSync(file);

  let parsed: unknown;
  try {
    parsed = JSON.parse(buf.toString('utf8'));
  } catch (err) {
    fail(`El archivo no es JSON válido: ${(err as Error).message}`);
  }

  const root = parsed as { words?: JmdictWord[]; version?: string; dictDate?: string };
  if (!Array.isArray(root.words)) {
    fail(
      'Formato inesperado: falta la propiedad "words".\n' +
        'Necesito el JSON de jmdict-simplified, no el XML original de JMdict.',
    );
  }
  Object.defineProperty(root.words, '__meta', {
    value: { version: root.version ?? null, dictDate: root.dictDate ?? null },
    enumerable: false,
  });
  return root.words as JmdictWord[] & { __meta?: unknown };
}

function buildGlosses(senses: JmdictSense[], lang = 'eng'): { glosses: string; pos: string } {
  const glosses: string[] = [];
  const pos = new Set<string>();

  for (const sense of senses) {
    for (const tag of sense.partOfSpeech ?? []) pos.add(tag);
    for (const g of sense.gloss ?? []) {
      // jmdict-simplified omite `lang` cuando es inglés (el default del formato).
      const glossLang = g.lang ?? 'eng';
      if (glossLang !== lang) continue;
      if (glosses.length < MAX_GLOSSES) glosses.push(g.text);
    }
  }
  return { glosses: glosses.join('; '), pos: [...pos].join(',') };
}

/** entry_id (JMdict) -> glosas en español, para pegarle al armar cada fila. */
function buildEsGlossMap(words: JmdictWord[] | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!words) return map;
  for (const word of words) {
    const { glosses } = buildGlosses(word.sense ?? [], 'spa');
    if (glosses) map.set(word.id, glosses);
  }
  return map;
}

function main(): void {
  const inputArg = process.argv[2];
  const inputPath = inputArg ? path.resolve(inputArg) : DEFAULT_IN;

  console.log(`leyendo  ${inputPath}`);
  const words = readSource(inputPath);
  const meta = (words as { __meta?: { version: string | null; dictDate: string | null } })
    .__meta;
  console.log(`entradas ${words.length.toLocaleString('es')}`);

  const esWords = readSourceOptional(DEFAULT_IN_ES);
  const esGlossMap = buildEsGlossMap(esWords);
  console.log(
    esWords
      ? `español  ${esGlossMap.size.toLocaleString('es')} entradas con glosa (${DEFAULT_IN_ES})`
      : `español  no encontrado, se omite (${DEFAULT_IN_ES})`,
  );

  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Se escribe a un temporal y se mueve al final: si el proceso muere a mitad,
  // no queda un jmdict.db corrupto que la app cargaría como si estuviera listo.
  const tmpPath = `${OUT_PATH}.building`;
  for (const p of [tmpPath, `${tmpPath}-wal`, `${tmpPath}-shm`]) {
    if (fs.existsSync(p)) fs.rmSync(p);
  }

  const db = new Database(tmpPath);
  db.pragma('journal_mode = OFF');
  db.pragma('synchronous = OFF');

  db.exec(`
    CREATE TABLE entries (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id  TEXT NOT NULL,
      lemma     TEXT NOT NULL,
      reading   TEXT,
      glosses   TEXT NOT NULL,
      glosses_es TEXT,
      pos       TEXT,
      is_common INTEGER NOT NULL DEFAULT 0,
      is_kana   INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE meta (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const insert = db.prepare(
    `INSERT INTO entries (entry_id, lemma, reading, glosses, glosses_es, pos, is_common, is_kana)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  let rows = 0;
  let skipped = 0;

  const run = db.transaction((list: JmdictWord[]) => {
    for (const word of list) {
      const senses = word.sense ?? [];
      const { glosses, pos } = buildGlosses(senses);
      if (!glosses) {
        skipped++;
        continue;
      }
      const glossesEs = esGlossMap.get(word.id) ?? null;

      const kana = word.kana ?? [];
      // Katakana -> hiragana: JMdict guarda lecturas en katakana incluso para
      // palabras que se leen en hiragana, y el tokenizer ya normaliza a
      // hiragana. Sin esto ラーメン quedaba con lectura ラーメン en vez de らーめん.
      const primaryReading = kana[0] ? katakanaToHiragana(kana[0].text) : null;
      const kanji = word.kanji ?? [];

      // Una fila por forma de escritura. El tokenizer puede devolver cualquiera
      // de ellas como lema, y todas apuntan al mismo significado.
      const forms: { text: string; common: boolean; isKana: boolean }[] = [
        ...kanji.map((k) => ({ text: k.text, common: !!k.common, isKana: false })),
        ...kana.map((k) => ({ text: k.text, common: !!k.common, isKana: true })),
      ];

      const seen = new Set<string>();
      for (const form of forms) {
        const lemma = normalizeLemma(form.text);
        if (!lemma || seen.has(lemma)) continue;
        seen.add(lemma);
        insert.run(
          word.id,
          lemma,
          primaryReading,
          glosses,
          glossesEs,
          pos || null,
          form.common ? 1 : 0,
          form.isKana ? 1 : 0,
        );
        rows++;
      }
    }
  });

  const started = Date.now();
  run(words);

  // El índice se crea después de insertar: mucho más rápido que mantenerlo vivo.
  console.log('indexando…');
  db.exec('CREATE INDEX idx_entries_lemma ON entries(lemma, is_common DESC)');

  const insertMeta = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
  insertMeta.run('jmdict_version', meta?.version ?? 'desconocida');
  insertMeta.run('jmdict_date', meta?.dictDate ?? 'desconocida');
  insertMeta.run('built_at', new Date().toISOString());
  insertMeta.run('rows', String(rows));

  db.exec('VACUUM');
  db.close();

  for (const p of [OUT_PATH, `${OUT_PATH}-wal`, `${OUT_PATH}-shm`]) {
    if (fs.existsSync(p)) fs.rmSync(p);
  }
  fs.renameSync(tmpPath, OUT_PATH);

  const mb = (fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(1);
  console.log(
    `listo    ${rows.toLocaleString('es')} formas, ${skipped} entradas sin glosa, ` +
      `${mb} MB, ${((Date.now() - started) / 1000).toFixed(1)}s`,
  );
  console.log(`salida   ${OUT_PATH}`);
}

main();
