import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export type DB = Database.Database;

const DATA_DIR = path.join(process.cwd(), 'data');
// Override para tests de integración: corren contra una copia temporal,
// nunca contra la base real. Sin esto, cada test que ejercita mineEpisode()
// o el curriculum escribe directo en los datos reales del usuario.
const APP_DB_PATH = process.env.APP_DB_PATH || path.join(DATA_DIR, 'app.db');
const DICT_DB_PATH = path.join(DATA_DIR, 'jmdict.db');

/**
 * Migraciones. Cada índice del array = una versión de schema (PRAGMA user_version).
 * Solo se agregan al final, nunca se editan las ya aplicadas.
 */
const MIGRATIONS: string[] = [
  // v1 — Fase 1 completa
  `
  CREATE TABLE episodes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    anime_name     TEXT NOT NULL,
    episode_label  TEXT,
    source_filename TEXT,
    file_hash      TEXT NOT NULL UNIQUE,
    total_lines    INTEGER,
    new_word_count INTEGER,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE mined_words (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id   INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    lemma        TEXT NOT NULL,
    surface      TEXT NOT NULL,
    reading      TEXT,
    meaning      TEXT,
    pos          TEXT,
    sentence     TEXT NOT NULL,
    start_ms     INTEGER,
    end_ms       INTEGER,
    unknown_in_line INTEGER,
    status       TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','added','skipped','already_known')),
    anki_note_id INTEGER,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (episode_id, lemma, sentence)
  );
  CREATE INDEX idx_mined_lemma  ON mined_words(lemma);
  CREATE INDEX idx_mined_status ON mined_words(episode_id, status, unknown_in_line);

  CREATE TABLE known_vocab (
    lemma         TEXT PRIMARY KEY,
    raw_field     TEXT,
    deck_name     TEXT,
    interval_days INTEGER,
    synced_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE ignored_words (
    lemma      TEXT PRIMARY KEY,
    reason     TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE anki_daily_stats (
    date         TEXT PRIMARY KEY,
    reviews_done INTEGER NOT NULL DEFAULT 0,
    cards_mature INTEGER NOT NULL DEFAULT 0,
    cards_total  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
  // v2 — curriculum (lecciones guiadas tipo Duolingo, empezando por hiragana)
  `
  CREATE TABLE curriculum_unit_progress (
    unit_id      TEXT PRIMARY KEY,
    status       TEXT NOT NULL DEFAULT 'locked'
                 CHECK (status IN ('locked','available','completed')),
    completed_at TEXT
  );

  CREATE TABLE curriculum_item_progress (
    item_id        TEXT PRIMARY KEY,
    unit_id        TEXT NOT NULL,
    correct_streak INTEGER NOT NULL DEFAULT 0,
    seen_count     INTEGER NOT NULL DEFAULT 0,
    interval_days  INTEGER NOT NULL DEFAULT 0,
    next_review_at TEXT NOT NULL DEFAULT (datetime('now')),
    mastered       INTEGER NOT NULL DEFAULT 0,
    last_seen_at   TEXT
  );
  CREATE INDEX idx_curriculum_item_unit ON curriculum_item_progress(unit_id);
  CREATE INDEX idx_curriculum_item_due  ON curriculum_item_progress(unit_id, next_review_at);

  CREATE TABLE curriculum_sessions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id       TEXT NOT NULL,
    started_at    TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at   TEXT,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_count   INTEGER NOT NULL DEFAULT 0
  );
  `,
  // v3 — Fase 2: registro de actividad de estudio (dashboard, rachas)
  `
  CREATE TABLE study_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    activity   TEXT NOT NULL CHECK (activity IN ('mining','anki_review','curriculum')),
    minutes    INTEGER,
    notes      TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_study_logs_date ON study_logs(date(created_at));
  `,
];

function applyMigrations(db: DB): void {
  const current = db.pragma('user_version', { simple: true }) as number;
  if (current >= MIGRATIONS.length) return;

  for (let v = current; v < MIGRATIONS.length; v++) {
    // Cada migración es atómica: si falla a mitad, no queda un schema roto.
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw new Error(`Migración v${v + 1} falló: ${(err as Error).message}`);
    }
  }
}

function openAppDb(): DB {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(APP_DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  applyMigrations(db);
  return db;
}

/**
 * Singleton colgado de globalThis: en `next dev` los módulos se recargan en
 * caliente y sin esto se abriría una conexión nueva por cada edición de archivo.
 */
const globalForDb = globalThis as unknown as {
  __appDb?: DB;
  __dictDb?: DB | null;
};

export function getDb(): DB {
  if (!globalForDb.__appDb) globalForDb.__appDb = openAppDb();
  return globalForDb.__appDb;
}

/**
 * Diccionario JMdict. DB separada, read-only, generada por `npm run build:jmdict`.
 * Devuelve null si todavía no se generó — la app debe seguir funcionando sin él
 * (mina palabras, solo sin lectura/significado) en vez de romperse al arrancar.
 */
export function getDictDb(): DB | null {
  if (globalForDb.__dictDb === undefined) {
    globalForDb.__dictDb = fs.existsSync(DICT_DB_PATH)
      ? new Database(DICT_DB_PATH, { readonly: true, fileMustExist: true })
      : null;
  }
  return globalForDb.__dictDb;
}

export function isDictReady(): boolean {
  return getDictDb() !== null;
}

// --- settings -------------------------------------------------------------

export function getSetting(key: string): string | null;
export function getSetting(key: string, fallback: string): string;
export function getSetting(key: string, fallback?: string): string | null {
  const row = getDb()
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(key) as { value: string } | undefined;
  return row?.value ?? fallback ?? null;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(key, value);
}

export const DB_PATHS = { DATA_DIR, APP_DB_PATH, DICT_DB_PATH } as const;
