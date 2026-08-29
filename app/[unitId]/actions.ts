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
): Promise<string> {
  const question = [
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
    return text || 'La IA no devolvió una explicación esta vez. Probá de nuevo.';
  } catch (err) {
    return `No se pudo obtener explicación: ${err instanceof Error ? err.message : 'error desconocido'}`;
  }
}
