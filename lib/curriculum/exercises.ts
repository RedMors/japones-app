import type { CurriculumItem } from './units.ts';
import type { Localized } from '@/lib/i18n/localized';

export type MultipleChoiceQuestion = {
  kind: 'choice';
  itemId: string;
  prompt: string;
  answer: string;
  choices: string[];
  subtext?: Localized;
  choiceReadings?: Record<string, string>;
};

/**
 * "Armá la respuesta con las piezas": el usuario reconstruye `answer` a
 * partir de fichas sueltas, sin verla como opción entre otras — recuerdo
 * activo en vez de reconocimiento. Se arma en `buildFillBlank` y se usa
 * como retry inmediato tras un error (ver session-runner.tsx) y como tipo
 * de pregunta para ítems que ya fallaron antes (ver getSessionItems).
 */
export type FillBlankQuestion = {
  kind: 'fill-blank';
  itemId: string;
  prompt: string;
  answer: string;
  subtext?: Localized;
  /** Piezas correctas en orden — se comparan contra lo que arma el usuario. */
  correctTiles: string[];
  /** Banco completo (piezas correctas + distractores), ya mezclado. */
  tiles: string[];
  /** Separador para reconstruir `answer` desde las piezas elegidas. */
  joiner: '' | ' ';
};

export type SessionQuestion = MultipleChoiceQuestion | FillBlankQuestion;

/** Ítem del pool con marca opcional de si venía fallado (repaso forzado). */
export type SessionItem = CurriculumItem & { retry?: boolean };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Opción múltiple con distractores del mismo grupo primero (confunden de
 * verdad, ej. し vs つ), y solo si no alcanzan se completa con cualquier otro
 * ítem del pool. Sin duplicar respuestas.
 *
 * Si el ítem trae `choices` propio (conjugación verbal: los distractores son
 * otras formas del MISMO verbo, no de otro ítem del pool), se usa eso
 * directo en vez de samplear del pool.
 */
export function buildMultipleChoice(
  item: CurriculumItem,
  pool: CurriculumItem[],
  numChoices = 4,
): MultipleChoiceQuestion {
  if (item.choices && item.choices.length > 0) {
    return {
      kind: 'choice',
      itemId: item.id,
      prompt: item.prompt,
      answer: item.answer,
      choices: shuffle(item.choices),
      subtext: item.subtext,
      choiceReadings: item.choiceReadings,
    };
  }

  const seen = new Set([item.answer]);
  const distractors: string[] = [];

  const sameGroup = shuffle(pool.filter((p) => p.id !== item.id && p.group === item.group));
  const rest = shuffle(pool.filter((p) => p.id !== item.id && p.group !== item.group));

  for (const candidate of [...sameGroup, ...rest]) {
    if (distractors.length >= numChoices - 1) break;
    if (seen.has(candidate.answer)) continue;
    seen.add(candidate.answer);
    distractors.push(candidate.answer);
  }

  return {
    kind: 'choice',
    itemId: item.id,
    prompt: item.prompt,
    answer: item.answer,
    choices: shuffle([item.answer, ...distractors]),
    subtext: item.subtext,
  };
}

/**
 * Con espacios: cada palabra es una ficha (frases/traducciones). Sin
 * espacios: cada caracter es una ficha (kana, kanji, romaji corto) — ahí sí
 * arma un rompecabezas real en vez de una sola ficha trivial.
 */
function splitIntoTiles(answer: string): { tiles: string[]; joiner: '' | ' ' } {
  if (answer.includes(' ')) {
    return { tiles: answer.split(' ').filter(Boolean), joiner: ' ' };
  }
  return { tiles: Array.from(answer), joiner: '' };
}

export function buildFillBlank(
  item: CurriculumItem,
  pool: CurriculumItem[],
  numDistractors = 3,
): FillBlankQuestion {
  const { tiles: correctTiles, joiner } = splitIntoTiles(item.answer);
  const seen = new Set(correctTiles);
  const distractors: string[] = [];

  for (const candidate of shuffle(pool.filter((p) => p.id !== item.id))) {
    if (distractors.length >= numDistractors) break;
    const { tiles: candidateTiles } = splitIntoTiles(candidate.answer);
    for (const tile of candidateTiles) {
      if (distractors.length >= numDistractors) break;
      if (seen.has(tile)) continue;
      seen.add(tile);
      distractors.push(tile);
    }
  }

  return {
    kind: 'fill-blank',
    itemId: item.id,
    prompt: item.prompt,
    answer: item.answer,
    subtext: item.subtext,
    correctTiles,
    tiles: shuffle([...correctTiles, ...distractors]),
    joiner,
  };
}

/**
 * Ítems marcados `retry` (fallaron la última vez que se vieron) se sirven
 * como fill-blank en vez de opción múltiple: ya demostraron que reconocer
 * entre 4 opciones no alcanza, hace falta reconstruir la respuesta.
 */
export function buildSession(items: SessionItem[], pool: CurriculumItem[]): SessionQuestion[] {
  return items.map((item) =>
    // Ítems con choices curados (conjugación: otras formas del mismo verbo,
    // con lectura) se quedan en opción múltiple — trocear su `answer` en
    // caracteres sueltos tira las lecturas y los distractores curados.
    item.retry && !(item.choices && item.choices.length > 0)
      ? buildFillBlank(item, pool)
      : buildMultipleChoice(item, pool),
  );
}
