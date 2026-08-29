/**
 * Orquesta el sentence miner: archivo de subtítulos -> palabras nuevas listas
 * para revisar y mandar a Anki.
 *
 * Fricción cero significa que esta es la única función que hace falta llamar
 * desde la UI para procesar un episodio entero.
 */
import { getDb } from './db.ts';
import { lookupWords } from './dictionary.ts';
import {
  decodeSubtitleBuffer,
  guessEpisodeMeta,
  hashContent,
  parseSubtitles,
  type SubtitleLine,
} from './parsers/index.ts';
import { extractWordsByLine, type WordCandidate } from './tokenizer.ts';
import { fetchKnownVocab, type FetchKnownVocabOptions } from './anki-connect.ts';
import { logStudy } from './study-log.ts';

export type MinedWordRow = {
  id: number;
  lemma: string;
  surface: string;
  reading: string | null;
  meaning: string | null;
  pos: string | null;
  sentence: string;
  startMs: number | null;
  endMs: number | null;
  unknownInLine: number;
  status: 'new' | 'added' | 'skipped' | 'already_known';
};

export type EpisodeSummary = {
  episodeId: number;
  animeName: string;
  episodeLabel: string | null;
  totalLines: number;
  newWordCount: number;
  words: MinedWordRow[];
};

/** El archivo ya se procesó antes (mismo contenido exacto). */
export class DuplicateEpisodeError extends Error {
  episodeId: number;
  constructor(episodeId: number) {
    super('Este episodio ya fue minado.');
    this.name = 'DuplicateEpisodeError';
    this.episodeId = episodeId;
  }
}

// --- vocabulario conocido, cacheado localmente -----------------------------

/**
 * Trae el vocabulario de Anki y lo guarda en `known_vocab`. Se llama a mano
 * desde un botón "actualizar vocabulario" — no en cada episodio, para que
 * subir un .srt nunca tenga que esperar a AnkiConnect.
 */
export async function refreshKnownVocab(options: FetchKnownVocabOptions = {}): Promise<number> {
  const words = await fetchKnownVocab(options);
  const db = getDb();

  const replace = db.transaction((rows: typeof words) => {
    db.prepare('DELETE FROM known_vocab').run();
    const insert = db.prepare(
      `INSERT INTO known_vocab (lemma, raw_field, deck_name, interval_days)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(lemma) DO UPDATE SET
         raw_field = excluded.raw_field,
         interval_days = excluded.interval_days,
         synced_at = datetime('now')`,
    );
    for (const w of rows) insert.run(w.lemma, w.rawField, w.deckName, w.intervalDays);
  });
  replace(words);

  return words.length;
}

export function getKnownVocabSyncedAt(): string | null {
  const row = getDb()
    .prepare('SELECT MAX(synced_at) as t FROM known_vocab')
    .get() as { t: string | null };
  return row.t;
}

export function getKnownVocabCount(): number {
  const row = getDb().prepare('SELECT count(*) as c FROM known_vocab').get() as { c: number };
  return row.c;
}

function getKnownLemmas(): Set<string> {
  const rows = getDb().prepare('SELECT lemma FROM known_vocab').all() as { lemma: string }[];
  return new Set(rows.map((r) => r.lemma));
}

function getIgnoredLemmas(): Set<string> {
  const rows = getDb().prepare('SELECT lemma FROM ignored_words').all() as { lemma: string }[];
  return new Set(rows.map((r) => r.lemma));
}

// --- minado -----------------------------------------------------------------

export type MineEpisodeInput = {
  filename: string;
  buffer: Uint8Array;
  /** Si el nombre del archivo no trae la serie clara, se puede forzar acá. */
  animeNameOverride?: string;
};

type LineWithWords = {
  line: SubtitleLine;
  words: WordCandidate[];
};

/**
 * Procesa un episodio de punta a punta: decodifica, parsea, tokeniza, filtra
 * contra lo ya conocido, busca en el diccionario, ordena por utilidad (i+1) y
 * guarda todo. Es sincrónico en DB (una sola transacción) para que un corte
 * a mitad de camino no deje datos parciales.
 */
export async function mineEpisode(input: MineEpisodeInput): Promise<EpisodeSummary> {
  const db = getDb();
  const fileHash = hashContent(input.buffer);

  const existing = db
    .prepare('SELECT id FROM episodes WHERE file_hash = ?')
    .get(fileHash) as { id: number } | undefined;
  if (existing) throw new DuplicateEpisodeError(existing.id);

  const content = decodeSubtitleBuffer(input.buffer);
  const parsed = parseSubtitles(input.filename, content);
  const meta = guessEpisodeMeta(input.filename);
  const animeName = input.animeNameOverride?.trim() || meta.animeName;

  const perLine = await extractWordsByLine(parsed.lines.map((l) => l.text));
  const lineWords: LineWithWords[] = parsed.lines.map((line, i) => ({
    line,
    words: perLine[i] ?? [],
  }));

  const known = getKnownLemmas();
  const ignored = getIgnoredLemmas();

  // Todas las palabras nuevas de todas las líneas, para el lookup en batch.
  const allNewLemmas = new Set<string>();
  for (const { words } of lineWords) {
    for (const w of words) {
      if (!known.has(w.lemma) && !ignored.has(w.lemma)) allNewLemmas.add(w.lemma);
    }
  }
  const dictEntries = lookupWords([...allNewLemmas]);

  type Candidate = {
    line: SubtitleLine;
    word: WordCandidate;
    unknownInLine: number;
  };
  const candidates: Candidate[] = [];

  for (const { line, words } of lineWords) {
    const newInLine = words.filter((w) => !known.has(w.lemma) && !ignored.has(w.lemma));
    for (const word of newInLine) {
      candidates.push({ line, word, unknownInLine: newInLine.length });
    }
  }

  // i+1 primero: líneas con una sola palabra desconocida son las más
  // aprendibles ahora mismo. Es el valor real del sentence mining.
  candidates.sort((a, b) => a.unknownInLine - b.unknownInLine);

  const insertEpisode = db.prepare(
    `INSERT INTO episodes (anime_name, episode_label, source_filename, file_hash, total_lines, new_word_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertWord = db.prepare(
    `INSERT INTO mined_words
       (episode_id, lemma, surface, reading, meaning, pos, sentence, start_ms, end_ms, unknown_in_line)
     VALUES (@episodeId, @lemma, @surface, @reading, @meaning, @pos, @sentence, @startMs, @endMs, @unknownInLine)
     ON CONFLICT(episode_id, lemma, sentence) DO NOTHING`,
  );

  const run = db.transaction(() => {
    const episodeResult = insertEpisode.run(
      animeName,
      meta.episodeLabel,
      input.filename,
      fileHash,
      parsed.lines.length,
      new Set(candidates.map((c) => c.word.lemma)).size,
    );
    const episodeId = Number(episodeResult.lastInsertRowid);

    for (const c of candidates) {
      const entry = dictEntries.get(c.word.lemma);
      insertWord.run({
        episodeId,
        lemma: c.word.lemma,
        surface: c.word.surface,
        reading: entry?.reading ?? c.word.reading,
        meaning: entry?.glosses ?? null,
        pos: c.word.pos,
        sentence: c.line.text,
        startMs: c.line.startMs,
        endMs: c.line.endMs,
        unknownInLine: c.unknownInLine,
      });
    }

    return episodeId;
  });

  const episodeId = run();
  logStudy({ activity: 'mining', notes: `${animeName} ${meta.episodeLabel ?? ''}`.trim() });

  return getEpisodeSummary(episodeId);
}

export function getEpisodeSummary(episodeId: number): EpisodeSummary {
  const db = getDb();
  const episode = db
    .prepare('SELECT * FROM episodes WHERE id = ?')
    .get(episodeId) as
    | {
        id: number;
        anime_name: string;
        episode_label: string | null;
        total_lines: number;
        new_word_count: number;
      }
    | undefined;

  if (!episode) throw new Error(`Episodio ${episodeId} no existe.`);

  const rows = db
    .prepare(
      `SELECT id, lemma, surface, reading, meaning, pos, sentence,
              start_ms, end_ms, unknown_in_line, status
       FROM mined_words
       WHERE episode_id = ?
       ORDER BY unknown_in_line ASC, id ASC`,
    )
    .all(episodeId) as {
    id: number;
    lemma: string;
    surface: string;
    reading: string | null;
    meaning: string | null;
    pos: string | null;
    sentence: string;
    start_ms: number | null;
    end_ms: number | null;
    unknown_in_line: number;
    status: MinedWordRow['status'];
  }[];

  return {
    episodeId: episode.id,
    animeName: episode.anime_name,
    episodeLabel: episode.episode_label,
    totalLines: episode.total_lines,
    newWordCount: episode.new_word_count,
    words: rows.map((r) => ({
      id: r.id,
      lemma: r.lemma,
      surface: r.surface,
      reading: r.reading,
      meaning: r.meaning,
      pos: r.pos,
      sentence: r.sentence,
      startMs: r.start_ms,
      endMs: r.end_ms,
      unknownInLine: r.unknown_in_line,
      status: r.status,
    })),
  };
}

// --- acciones sobre una palabra minada ---------------------------------

export function setWordStatus(
  wordId: number,
  status: MinedWordRow['status'],
  ankiNoteId?: number,
): void {
  getDb()
    .prepare('UPDATE mined_words SET status = ?, anki_note_id = ? WHERE id = ?')
    .run(status, ankiNoteId ?? null, wordId);
}

/** Descarta la palabra para siempre: no vuelve a aparecer en ningún episodio. */
export function ignoreWordGlobally(lemma: string, reason?: string): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      `INSERT INTO ignored_words (lemma, reason) VALUES (?, ?)
       ON CONFLICT(lemma) DO UPDATE SET reason = excluded.reason`,
    ).run(lemma, reason ?? null);
    db.prepare(
      `UPDATE mined_words SET status = 'skipped' WHERE lemma = ? AND status = 'new'`,
    ).run(lemma);
  })();
}

export function listEpisodes(limit = 20): {
  id: number;
  animeName: string;
  episodeLabel: string | null;
  newWordCount: number;
  createdAt: string;
}[] {
  const rows = getDb()
    .prepare(
      `SELECT id, anime_name, episode_label, new_word_count, created_at
       FROM episodes ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit) as {
    id: number;
    anime_name: string;
    episode_label: string | null;
    new_word_count: number;
    created_at: string;
  }[];

  return rows.map((r) => ({
    id: r.id,
    animeName: r.anime_name,
    episodeLabel: r.episode_label,
    newWordCount: r.new_word_count,
    createdAt: r.created_at,
  }));
}
