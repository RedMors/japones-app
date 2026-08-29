/**
 * Cliente de AnkiConnect (http://localhost:8765).
 *
 * Requiere Anki abierto con el addon AnkiConnect instalado. Anki cerrado es el
 * fallo más común de esta app, así que todo acá está diseñado para detectarlo
 * rápido y decirlo claro, nunca para quedarse colgado esperando.
 */
import { ankiFieldToLemmas, normalizeLemma } from './normalize.ts';

const ANKI_URL = process.env.ANKI_CONNECT_URL ?? 'http://localhost:8765';
const ANKI_VERSION = 6;

/** Corto a propósito: es localhost, si no responde en 2s es que no está. */
const PING_TIMEOUT_MS = 2_000;
/** Traer miles de notas sí puede tardar. */
const QUERY_TIMEOUT_MS = 60_000;

const NOTES_CHUNK = 500;

/** Anki no está abierto, o el addon no está instalado. */
export class AnkiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(
      'No pude conectarme a Anki. Abrilo y verificá que tenga el addon ' +
        'AnkiConnect instalado.',
    );
    this.name = 'AnkiUnavailableError';
    this.cause = cause;
  }
}

/** Anki respondió, pero rechazó la operación. */
export class AnkiError extends Error {
  action: string;

  constructor(message: string, action: string) {
    super(message);
    this.name = 'AnkiError';
    this.action = action;
  }
}

async function ankiRequest<T>(
  action: string,
  params: Record<string, unknown> = {},
  timeoutMs = QUERY_TIMEOUT_MS,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(ANKI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, version: ANKI_VERSION, params }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
  } catch (err) {
    // ECONNREFUSED, timeout, DNS: para el usuario es todo lo mismo, Anki no está.
    throw new AnkiUnavailableError(err);
  }

  if (!response.ok) {
    throw new AnkiError(`AnkiConnect respondió HTTP ${response.status}`, action);
  }

  const payload = (await response.json()) as { result: T; error: string | null };
  if (payload.error) throw new AnkiError(payload.error, action);
  return payload.result;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Escapa un valor para meterlo dentro de comillas en una búsqueda de Anki. */
export function escapeQuery(value: string): string {
  return value.replace(/["\\]/g, '\\$&');
}

/** Anki no acepta espacios dentro de un tag. */
export function sanitizeTag(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/["\\]/g, '')
    .slice(0, 80);
}

// --- estado ---------------------------------------------------------------

export type AnkiStatus =
  | { connected: true; version: number }
  | { connected: false; message: string };

/**
 * Nunca tira excepción: devuelve el estado para que la UI muestre un aviso
 * en vez de un spinner infinito o una pantalla de error.
 */
export async function getStatus(): Promise<AnkiStatus> {
  try {
    const version = await ankiRequest<number>('version', {}, PING_TIMEOUT_MS);
    if (version < ANKI_VERSION) {
      return {
        connected: false,
        message: `AnkiConnect está en versión ${version}; hace falta ${ANKI_VERSION} o mayor.`,
      };
    }
    return { connected: true, version };
  } catch (err) {
    return {
      connected: false,
      message: err instanceof Error ? err.message : 'Error desconocido conectando a Anki.',
    };
  }
}

// --- mazos y tarjetas -----------------------------------------------------

export function getDeckNames(): Promise<string[]> {
  return ankiRequest<string[]>('deckNames');
}

export function getModelNames(): Promise<string[]> {
  return ankiRequest<string[]>('modelNames');
}

export function getModelFieldNames(modelName: string): Promise<string[]> {
  return ankiRequest<string[]>('modelFieldNames', { modelName });
}

export function findCards(query: string): Promise<number[]> {
  return ankiRequest<number[]>('findCards', { query });
}

export function findNotes(query: string): Promise<number[]> {
  return ankiRequest<number[]>('findNotes', { query });
}

/**
 * Intervalos en días. AnkiConnect devuelve segundos en negativo para tarjetas
 * en aprendizaje; esas cuentan como 0 días.
 */
export async function getIntervals(cardIds: number[]): Promise<number[]> {
  if (cardIds.length === 0) return [];
  const raw = await ankiRequest<number[]>('getIntervals', { cards: cardIds });
  return raw.map((value) => (value < 0 ? 0 : value));
}

export type DeckStats = {
  deckName: string;
  total: number;
  mature: number;
};

/** Intervalo a partir del cual se considera que la palabra está dominada. */
export const MATURE_INTERVAL_DAYS = 21;

export async function getDeckStats(): Promise<DeckStats[]> {
  const decks = await getDeckNames();
  const stats: DeckStats[] = [];

  for (const deckName of decks) {
    const escaped = escapeQuery(deckName);
    const total = await findCards(`deck:"${escaped}"`);
    const mature = await findCards(
      `deck:"${escaped}" prop:ivl>=${MATURE_INTERVAL_DAYS}`,
    );
    stats.push({ deckName, total: total.length, mature: mature.length });
  }

  return stats;
}

// --- repasos, racha y tendencia -------------------------------------------

export type DayReviews = { date: string; reviews: number };

/**
 * Repasos por día, del historial real de Anki. No de snapshots propios: la
 * racha no se puede romper por no haber abierto esta app ese día.
 */
export async function getReviewsByDay(days = 30): Promise<DayReviews[]> {
  const raw = await ankiRequest<[string, number][]>('getNumCardsReviewedByDay');
  const byDate = new Map(raw.map(([date, count]) => [date, count]));

  const out: DayReviews[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toLocalDate(d);
    out.push({ date: key, reviews: byDate.get(key) ?? 0 });
  }
  return out;
}

function toLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Días consecutivos con al menos un repaso.
 *
 * Si hoy todavía no repasaste, la racha se cuenta desde ayer: a las 9 de la
 * mañana no tiene sentido decirte que la racha es 0. Y si se corta, se corta
 * y ya — el conteo arranca de nuevo, sin mensajes de culpa.
 */
export function computeStreak(daily: DayReviews[]): number {
  const ordered = [...daily].sort((a, b) => b.date.localeCompare(a.date));
  if (ordered.length === 0) return 0;

  let index = 0;
  if (ordered[0].reviews === 0) index = 1; // el día en curso no penaliza

  let streak = 0;
  for (let i = index; i < ordered.length; i++) {
    if (ordered[i].reviews > 0) streak++;
    else break;
  }
  return streak;
}

// --- vocabulario conocido -------------------------------------------------

type NoteInfo = {
  noteId: number;
  modelName: string;
  tags: string[];
  fields: Record<string, { value: string; order: number }>;
  cards: number[];
};

export type KnownWord = {
  lemma: string;
  rawField: string;
  deckName: string | null;
  intervalDays: number;
};

/** Nombres de campo que suelen contener la palabra, en orden de preferencia. */
const WORD_FIELD_HINTS = [
  'word',
  'expression',
  'vocab',
  'vocabulary',
  'target word',
  'term',
  'kanji',
  '単語',
  '表現',
  'japanese',
  'front',
];

/** Elige el campo de vocabulario de una nota sin que tengas que configurarlo. */
export function pickVocabField(fieldNames: string[]): string | null {
  if (fieldNames.length === 0) return null;
  const lower = fieldNames.map((n) => n.toLowerCase().trim());

  for (const hint of WORD_FIELD_HINTS) {
    const index = lower.indexOf(hint);
    if (index !== -1) return fieldNames[index];
  }
  // Sin pista: el primer campo es el de ordenamiento y casi siempre es la palabra.
  return fieldNames[0];
}

export type FetchKnownVocabOptions = {
  /** Mazos a leer. Vacío = todos. */
  decks?: string[];
  /** Fuerza el campo a leer, salteando la heurística. */
  fieldName?: string;
  /** Solo notas con japonés en el campo elegido. */
  requireJapanese?: boolean;
};

/**
 * Trae el vocabulario que ya tenés en Anki, normalizado y listo para comparar
 * contra lo que sale del tokenizer. Guarda el intervalo mayor entre las
 * tarjetas de la nota.
 */
export async function fetchKnownVocab(
  options: FetchKnownVocabOptions = {},
): Promise<KnownWord[]> {
  const { decks = [], fieldName } = options;

  const query =
    decks.length > 0
      ? decks.map((d) => `deck:"${escapeQuery(d)}"`).join(' OR ')
      : 'deck:*';

  const noteIds = await findNotes(query);
  if (noteIds.length === 0) return [];

  const byLemma = new Map<string, KnownWord>();

  for (const batch of chunk(noteIds, NOTES_CHUNK)) {
    const notes = await ankiRequest<NoteInfo[]>('notesInfo', { notes: batch });

    // Intervalos de todas las tarjetas del lote, en una sola llamada.
    const cardIds = notes.flatMap((n) => n.cards ?? []);
    const intervals = await getIntervals(cardIds);
    const intervalByCard = new Map<number, number>();
    cardIds.forEach((id, i) => intervalByCard.set(id, intervals[i] ?? 0));

    for (const note of notes) {
      const fieldNames = Object.keys(note.fields ?? {});
      const chosen = fieldName && note.fields[fieldName] ? fieldName : pickVocabField(fieldNames);
      if (!chosen) continue;

      const rawField = note.fields[chosen]?.value ?? '';
      if (!rawField.trim()) continue;

      const noteInterval = Math.max(
        0,
        ...(note.cards ?? []).map((id) => intervalByCard.get(id) ?? 0),
      );

      for (const lemma of ankiFieldToLemmas(rawField)) {
        const existing = byLemma.get(lemma);
        // Si la palabra aparece en varias notas, gana el intervalo más alto.
        if (existing && existing.intervalDays >= noteInterval) continue;
        byLemma.set(lemma, {
          lemma,
          rawField,
          deckName: null,
          intervalDays: noteInterval,
        });
      }
    }
  }

  return [...byLemma.values()];
}

// --- agregar tarjetas -----------------------------------------------------

export type NoteFieldMap = {
  word: string;
  reading?: string;
  meaning?: string;
  sentence?: string;
};

export type AnkiTargetConfig = {
  deckName: string;
  modelName: string;
  fields: NoteFieldMap;
};

const READING_HINTS = ['reading', 'furigana', 'kana', 'pronunciation', '読み', 'よみ'];
const MEANING_HINTS = [
  'meaning',
  'definition',
  'english',
  'translation',
  'glossary',
  '意味',
  'back',
];
const SENTENCE_HINTS = [
  'sentence',
  'example',
  'examplesentence',
  'example sentence',
  'context',
  '例文',
];

function pickField(fieldNames: string[], hints: string[]): string | undefined {
  const lower = fieldNames.map((n) => n.toLowerCase().trim());
  for (const hint of hints) {
    const index = lower.indexOf(hint);
    if (index !== -1) return fieldNames[index];
  }
  return undefined;
}

/**
 * Adivina a qué campos del modelo va cada dato, para que puedas minar sin
 * configurar nada primero. Se puede sobreescribir después desde settings.
 */
export async function guessTargetConfig(
  deckName: string,
  modelName: string,
): Promise<AnkiTargetConfig> {
  const fieldNames = await getModelFieldNames(modelName);
  const word = pickVocabField(fieldNames);
  if (!word) {
    throw new AnkiError(`El modelo "${modelName}" no tiene campos.`, 'modelFieldNames');
  }

  const rest = fieldNames.filter((f) => f !== word);
  return {
    deckName,
    modelName,
    fields: {
      word,
      reading: pickField(rest, READING_HINTS),
      meaning: pickField(rest, MEANING_HINTS),
      sentence: pickField(rest, SENTENCE_HINTS),
    },
  };
}

export type WordNoteInput = {
  word: string;
  reading?: string | null;
  meaning?: string | null;
  sentence?: string | null;
  animeName: string;
  episodeLabel?: string | null;
};

export function buildTags(input: WordNoteInput): string[] {
  const anime = sanitizeTag(input.animeName);
  const tags = ['sentence-mining'];
  if (anime) {
    tags.push(`anime::${anime}`);
    const episode = input.episodeLabel ? sanitizeTag(input.episodeLabel) : '';
    if (episode) tags.push(`anime::${anime}::${episode}`);
  }
  return tags;
}

function buildFields(input: WordNoteInput, config: AnkiTargetConfig): Record<string, string> {
  const fields: Record<string, string> = { [config.fields.word]: input.word };
  if (config.fields.reading && input.reading) fields[config.fields.reading] = input.reading;
  if (config.fields.meaning && input.meaning) fields[config.fields.meaning] = input.meaning;
  if (config.fields.sentence && input.sentence) fields[config.fields.sentence] = input.sentence;
  return fields;
}

/** ¿Se puede agregar, o Anki la marcaría como duplicada? */
export async function canAddNote(
  input: WordNoteInput,
  config: AnkiTargetConfig,
): Promise<boolean> {
  const [ok] = await ankiRequest<boolean[]>('canAddNotes', {
    notes: [
      {
        deckName: config.deckName,
        modelName: config.modelName,
        fields: buildFields(input, config),
        tags: buildTags(input),
      },
    ],
  });
  return ok === true;
}

/** Crea la tarjeta. Devuelve el noteId. */
export async function addWordNote(
  input: WordNoteInput,
  config: AnkiTargetConfig,
): Promise<number> {
  const noteId = await ankiRequest<number | null>('addNote', {
    note: {
      deckName: config.deckName,
      modelName: config.modelName,
      fields: buildFields(input, config),
      tags: buildTags(input),
      options: {
        allowDuplicate: false,
        duplicateScope: 'deck',
        duplicateScopeOptions: {
          deckName: config.deckName,
          checkChildren: true,
        },
      },
    },
  });

  if (noteId === null) {
    throw new AnkiError(
      `Anki no creó la tarjeta para "${input.word}" (probablemente ya existe en el mazo).`,
      'addNote',
    );
  }
  return noteId;
}

/** ¿Esta palabra ya está en Anki? Consulta directa, sin usar la caché local. */
export async function isWordInAnki(word: string): Promise<boolean> {
  const lemma = normalizeLemma(word);
  if (!lemma) return false;
  const found = await findNotes(`"${escapeQuery(lemma)}"`);
  return found.length > 0;
}
