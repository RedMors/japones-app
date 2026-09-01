'use server';

import {
  recordAnswer,
  checkAndUnlockNext,
  startSession,
  finishSession,
  isUnitComplete,
} from '@/lib/curriculum/progress';
import { logStudy } from '@/lib/study-log';
import { askOpenRouter } from '@/lib/openrouter';
import type { Lang } from '@/lib/i18n/dictionary';

export async function beginSession(unitId: string): Promise<number> {
  return startSession(unitId);
}

export async function submitAnswer(
  unitId: string,
  itemId: string,
  correct: boolean,
): Promise<void> {
  recordAnswer(unitId, itemId, correct);
}

export async function endSession(
  sessionId: number,
  unitId: string,
  correctCount: number,
  totalCount: number,
): Promise<{ unitCompleted: boolean }> {
  const wasComplete = isUnitComplete(unitId);
  finishSession(sessionId, correctCount, totalCount);
  logStudy({ activity: 'curriculum', notes: unitId });
  checkAndUnlockNext(unitId);
  const isCompleteNow = isUnitComplete(unitId);

  return { unitCompleted: isCompleteNow && !wasComplete };
}

export async function explainGrammar(
  prompt: string,
  answer: string,
  subtext?: string,
  lang: Lang = 'es',
): Promise<string> {
  const question =
    lang === 'en'
      ? [
          "I'm learning Japanese, beginner level (JLPT N5-N4).",
          `Grammar exercise: "${prompt}"`,
          subtext ? `Given translation/context: ${subtext}` : null,
          `The correct answer is: "${answer}".`,
          'Explain in English, in 3-4 simple sentences, the grammar RULE behind why that is the correct answer — don\'t just translate the sentence. If relevant, mention when that form/particle is used in general, not just in this example.',
        ]
          .filter(Boolean)
          .join('\n')
      : [
          'Estoy aprendiendo japonés, nivel principiante (JLPT N5-N4).',
          `Ejercicio de gramática: "${prompt}"`,
          subtext ? `Traducción/contexto dado: ${subtext}` : null,
          `La respuesta correcta es: "${answer}".`,
          'Explicame en español, en 3-4 oraciones simples, la REGLA gramatical detrás de por qué esa es la respuesta correcta — no solo traduzcas la oración. Si aplica, mencioná cuándo se usa esa forma/partícula en general, no solo en este ejemplo.',
        ]
          .filter(Boolean)
          .join('\n');

  try {
    const text = await askOpenRouter(question);
    if (text) return text;
    return lang === 'en'
      ? 'The AI did not return an explanation this time. Try again.'
      : 'La IA no devolvió una explicación esta vez. Probá de nuevo.';
  } catch (err) {
    const message = err instanceof Error ? err.message : lang === 'en' ? 'unknown error' : 'error desconocido';
    return lang === 'en' ? `Could not get an explanation: ${message}` : `No se pudo obtener explicación: ${message}`;
  }
}
