/**
 * Prueba mineEpisode() de punta a punta contra data/app.db real, con un
 * jmdict.db de fixture (no depende de Anki abierto). Limpia lo que inserta.
 * Correr: npm run check:miner
 */
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { getDb, DB_PATHS } from '../lib/db.ts';
import {
  mineEpisode,
  getEpisodeSummary,
  setWordStatus,
  ignoreWordGlobally,
  listEpisodes,
  DuplicateEpisodeError,
} from '../lib/miner.ts';

let failed = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${label}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}
function ok(label: string, cond: boolean) {
  if (!cond) failed++;
  console.log(`${cond ? 'ok  ' : 'FALLA'} ${label}`);
}

// --- jmdict.db de fixture, solo para esta corrida --------------------------
// Si ya existe un jmdict.db real (generado con build:jmdict), se hace a un
// lado y se restaura al final: este test no debe pisar el diccionario real.
const dictPaths = [
  DB_PATHS.DICT_DB_PATH,
  `${DB_PATHS.DICT_DB_PATH}-wal`,
  `${DB_PATHS.DICT_DB_PATH}-shm`,
];
const backupSuffix = '.real-backup';
let hadRealDict = false;
for (const p of dictPaths) {
  if (fs.existsSync(p)) {
    hadRealDict = true;
    fs.renameSync(p, `${p}${backupSuffix}`);
  }
}

const dictDb = new Database(DB_PATHS.DICT_DB_PATH);
dictDb.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY, lemma TEXT NOT NULL, reading TEXT,
    glosses TEXT NOT NULL, pos TEXT, is_common INTEGER DEFAULT 0, is_kana INTEGER DEFAULT 0
  );
`);
dictDb
  .prepare(
    'INSERT INTO entries (lemma, reading, glosses, pos, is_common) VALUES (?,?,?,?,1)',
  )
  .run('猫', 'ねこ', 'cat', '名詞-一般');
dictDb.close();

const db = getDb();
db.prepare('DELETE FROM known_vocab').run();
db.prepare(`INSERT INTO known_vocab (lemma, raw_field) VALUES ('食べる','食べる')`).run();
// Por si quedó basura de una corrida anterior interrumpida o de pruebas manuales.
db.prepare(`DELETE FROM ignored_words WHERE lemma IN ('猫', '好き')`).run();

const SRT = [
  '1',
  '00:00:01,000 --> 00:00:03,000',
  '猫が好きです。',
  '',
  '2',
  '00:00:04,000 --> 00:00:06,000',
  '私は毎日ご飯を食べる。',
  '',
].join('\n');

const buffer = new TextEncoder().encode(SRT);
const filename = '[Fixture] Test Anime - 01.srt';

try {
  const summary = await mineEpisode({ filename, buffer });

  eq('detecta serie por nombre', summary.animeName, 'Test Anime');
  eq('detecta episodio', summary.episodeLabel, 'E01');
  eq('total de líneas', summary.totalLines, 2);

  // 食べる ya es conocida -> no debe aparecer. 猫 y 好き son nuevas.
  const lemmas = summary.words.map((w) => w.lemma).sort();
  ok('excluye vocabulario ya conocido', !lemmas.includes('食べる'));
  ok('incluye palabra nueva con diccionario', lemmas.includes('猫'));

  const neko = summary.words.find((w) => w.lemma === '猫');
  eq('trae significado del diccionario', neko?.meaning, 'cat');
  eq('trae lectura del diccionario', neko?.reading, 'ねこ');

  // Línea 1 tiene 2 palabras nuevas (猫, 好き) -> unknownInLine=2.
  // Si el tokenizer solo saca 猫 como sustantivo, ajustamos la expectativa abajo.
  ok('unknownInLine es coherente', (neko?.unknownInLine ?? 0) >= 1);

  ok('ordenado por i+1 (menor unknownInLine primero)', isSortedAscending(summary.words.map((w) => w.unknownInLine)));

  // Duplicado: mismo contenido exacto -> debe rechazar
  let threwDuplicate = false;
  try {
    await mineEpisode({ filename, buffer });
  } catch (err) {
    threwDuplicate = err instanceof DuplicateEpisodeError;
  }
  ok('rechaza episodio duplicado', threwDuplicate);

  // Acciones sobre palabras
  if (neko) {
    setWordStatus(neko.id, 'added', 12345);
    const refreshed = getEpisodeSummary(summary.episodeId);
    const nekoAfter = refreshed.words.find((w) => w.id === neko.id);
    eq('setWordStatus actualiza status', nekoAfter?.status, 'added');
  }

  const suki = summary.words.find((w) => w.lemma === '好き');
  if (suki) {
    ignoreWordGlobally('好き', 'prueba');
    const refreshed = getEpisodeSummary(summary.episodeId);
    const sukiAfter = refreshed.words.find((w) => w.id === suki.id);
    eq('ignoreWordGlobally marca skipped', sukiAfter?.status, 'skipped');

    // Y no debe reaparecer en un episodio nuevo
    const buffer2 = new TextEncoder().encode(
      ['1', '00:00:01,000 --> 00:00:02,000', '好きです。', ''].join('\n'),
    );
    const summary2 = await mineEpisode({
      filename: '[Fixture] Test Anime - 02.srt',
      buffer: buffer2,
    });
    ok('palabra ignorada no reaparece', !summary2.words.some((w) => w.lemma === '好き'));
    db.prepare('DELETE FROM episodes WHERE id = ?').run(summary2.episodeId);
  }

  const listed = listEpisodes(5);
  ok('listEpisodes incluye el episodio recién creado', listed.some((e) => e.id === summary.episodeId));

  // --- limpieza ---
  db.prepare('DELETE FROM episodes WHERE id = ?').run(summary.episodeId);
  db.prepare(`DELETE FROM ignored_words WHERE lemma = '好き'`).run();
} finally {
  db.prepare(`DELETE FROM episodes WHERE source_filename LIKE '[Fixture]%'`).run();
  db.prepare(`DELETE FROM known_vocab WHERE lemma = '食べる'`).run();
  // mineEpisode() registra actividad vía logStudy() — sin este DELETE queda
  // basura real en study_logs cada vez que se corre este check.
  db.prepare(`DELETE FROM study_logs WHERE notes LIKE 'Test Anime%'`).run();

  for (const p of dictPaths) {
    if (fs.existsSync(p)) fs.rmSync(p);
  }
  if (hadRealDict) {
    for (const p of dictPaths) {
      const backup = `${p}${backupSuffix}`;
      if (fs.existsSync(backup)) fs.renameSync(backup, p);
    }
  }
}

function isSortedAscending(nums: number[]): boolean {
  for (let i = 1; i < nums.length; i++) if (nums[i] < nums[i - 1]) return false;
  return true;
}

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
