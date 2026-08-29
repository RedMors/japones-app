/**
 * Convierte las listas públicas JLPT (elzup/jlpt-word-list, MIT) a
 * data/jlpt/{n5,n4,n3,n2,n1}.json, enriquecidas con JMdict cuando hay match.
 *
 * Fuente (ya bajada a mano en data/jlpt/raw/*.csv):
 *   https://github.com/elzup/jlpt-word-list  (src/n1.csv … n5.csv)
 *
 * Correr: npm run build:jlpt-vocab
 */
import fs from 'node:fs';
import path from 'node:path';
import { getDictDb } from '../lib/db.ts';
import { normalizeLemma } from '../lib/normalize.ts';

const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const;
const JAPANESE_KANJI_RE = /[一-鿿㐀-䶿]/;
const RAW_DIR = path.join(process.cwd(), 'data', 'jlpt', 'raw');
const OUT_DIR = path.join(process.cwd(), 'data', 'jlpt');

export type JlptWord = {
  lemma: string;
  reading: string;
  meaning: string;
};

/** Parser CSV mínimo: comillas dobles, comas dentro de comillas, "" escapada. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 && r.some((c) => c.trim() !== ''));
}

/** Primera glosa corta, para que entre como opción en un botón. */
function shortGloss(meaning: string): string {
  const first = meaning.split(/[;,]/)[0].trim();
  return first.length > 36 ? `${first.slice(0, 33)}…` : first;
}

function main(): void {
  const dictDb = getDictDb();
  if (!dictDb) {
    console.error(
      '\njmdict.db no existe todavía. Corré `npm run build:jmdict` primero.\n',
    );
    process.exit(1);
  }
  const lookup = dictDb.prepare(
    'SELECT reading, glosses FROM entries WHERE lemma = ? ORDER BY is_common DESC LIMIT 1',
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const level of LEVELS) {
    const rawPath = path.join(RAW_DIR, `${level}.csv`);
    if (!fs.existsSync(rawPath)) {
      console.error(`falta ${rawPath}, se salta ${level}`);
      continue;
    }

    const rows = parseCsv(fs.readFileSync(rawPath, 'utf8'));
    const [header, ...body] = rows;
    const idx = {
      expression: header.indexOf('expression'),
      reading: header.indexOf('reading'),
      meaning: header.indexOf('meaning'),
    };

    const words: JlptWord[] = [];
    const seen = new Set<string>();
    let dictHits = 0;
    let noMatch: string[] = [];

    for (const cols of body) {
      let rawExpr = cols[idx.expression]?.trim();
      const rawReading = cols[idx.reading]?.trim();
      const rawMeaning = cols[idx.meaning]?.trim();
      if (!rawExpr || !rawMeaning) continue;

      // La lista trae a veces variantes combinadas ("在る；有る") o anotaciones
      // de dialecto ("しまった (かん)"): nos quedamos con la primera forma.
      rawExpr = rawExpr.split(/[；;]/)[0].replace(/\s*[（(][^）)]*[）)]\s*$/, '').trim();

      // Morfemas de afijo ("上~", "~増し") y entradas con múltiples variantes
      // separadas por coma (ASCII o japonesa) dentro del mismo campo: no son
      // palabras aisladas con un significado propio para opción múltiple.
      if (/[~〜～,、]/.test(rawExpr)) continue;

      const lemma = normalizeLemma(rawExpr);
      if (!lemma || seen.has(lemma)) continue;
      seen.add(lemma);

      // La lista pública a veces tiene las columnas mal — "reading" con kanji
      // en vez de una lectura fonética (visto en あいさつする -> 挨拶). Una
      // "lectura" con kanji no sirve para furigana ni para nada.
      const cleanRawReading =
        rawReading && !JAPANESE_KANJI_RE.test(rawReading) ? normalizeLemma(rawReading) : '';

      const entry = lookup.get(lemma) as { reading: string | null; glosses: string } | undefined;
      if (entry) {
        dictHits++;
        words.push({
          lemma,
          reading: entry.reading ?? cleanRawReading,
          meaning: shortGloss(entry.glosses),
        });
      } else {
        noMatch.push(lemma);
        // Sin match en JMdict: se usa la lista JLPT tal cual, no se descarta.
        // Es una fuente pública igual de válida, solo sin la glosa curada.
        words.push({
          lemma,
          reading: cleanRawReading,
          meaning: shortGloss(rawMeaning),
        });
      }
    }

    fs.writeFileSync(path.join(OUT_DIR, `${level}.json`), JSON.stringify(words, null, 0));

    console.log(
      `${level}: ${words.length} palabras, ${dictHits} con JMdict, ${noMatch.length} solo de la lista pública`,
    );
    if (noMatch.length > 0 && noMatch.length <= 8) {
      console.log(`  sin match: ${noMatch.join(', ')}`);
    }
  }
}

main();
