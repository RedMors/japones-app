/**
 * Verifica que app.db se cree, migre y responda. Correr: npm run db:check
 */
import { getDb, getSetting, setSetting, isDictReady, DB_PATHS } from '../lib/db.ts';

const db = getDb();

const version = db.pragma('user_version', { simple: true });
const tables = (
  db
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type='table' AND name NOT LIKE 'sqlite_%'
       ORDER BY name`,
    )
    .all() as { name: string }[]
).map((r) => r.name);

console.log('app.db      ', DB_PATHS.APP_DB_PATH);
console.log('user_version', version);
console.log('tablas      ', tables.join(', '));
console.log('journal_mode', db.pragma('journal_mode', { simple: true }));
console.log('foreign_keys', db.pragma('foreign_keys', { simple: true }));
console.log('jmdict listo', isDictReady());

// round-trip de settings
setSetting('smoke_test', 'ok');
console.log('settings r/w', getSetting('smoke_test'));
db.prepare('DELETE FROM settings WHERE key = ?').run('smoke_test');

// el CHECK de status debe rechazar valores inválidos
db.prepare(
  `INSERT INTO episodes (anime_name, file_hash) VALUES ('smoke', 'hash-smoke')`,
).run();
const epId = db.prepare(`SELECT id FROM episodes WHERE file_hash='hash-smoke'`).get() as {
  id: number;
};
let checkHeld = false;
try {
  db.prepare(
    `INSERT INTO mined_words (episode_id, lemma, surface, sentence, status)
     VALUES (?, 'x', 'x', 'x', 'basura')`,
  ).run(epId.id);
} catch {
  checkHeld = true;
}
console.log('CHECK status', checkHeld ? 'rechaza inválidos' : 'NO VALIDA (bug)');

// ON DELETE CASCADE
db.prepare(
  `INSERT INTO mined_words (episode_id, lemma, surface, sentence) VALUES (?, 'x', 'x', 'x')`,
).run(epId.id);
db.prepare('DELETE FROM episodes WHERE id = ?').run(epId.id);
const orphans = db
  .prepare('SELECT count(*) c FROM mined_words WHERE episode_id = ?')
  .get(epId.id) as { c: number };
console.log('CASCADE     ', orphans.c === 0 ? 'borra hijos' : `deja ${orphans.c} huérfanos (bug)`);
