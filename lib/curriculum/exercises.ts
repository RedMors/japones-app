import type { CurriculumItem } from './units.ts';

export type MultipleChoiceQuestion = {
  itemId: string;
  prompt: string;
  answer: string;
  choices: string[];
  subtext?: string;
  choiceReadings?: Record<string, string>;
};

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
    itemId: item.id,
    prompt: item.prompt,
    answer: item.answer,
    choices: shuffle([item.answer, ...distractors]),
    subtext: item.subtext,
  };
}

export function buildSession(
  items: CurriculumItem[],
  pool: CurriculumItem[],
): MultipleChoiceQuestion[] {
  return items.map((item) => buildMultipleChoice(item, pool));
}
