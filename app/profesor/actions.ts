'use server';

import { askOpenRouterChat, type ChatMessage } from '@/lib/openrouter';

const SYSTEM_PROMPT = [
  'Sos un profesor de japonés paciente y claro, dando clases particulares a un',
  'estudiante hispanohablante que recién arranca (nivel principiante, N5-N4).',
  'Respondé siempre en español. Cuando escribas japonés, poné la lectura en',
  'hiragana entre paréntesis al lado de cada palabra con kanji, ej: 食べる(たべる).',
  'Explicá con ejemplos simples antes que con reglas abstractas. Si la duda',
  'es ambigua, hacé como máximo una pregunta aclaratoria antes de responder.',
  'Sé breve: 3-5 oraciones salvo que el estudiante pida más detalle.',
].join(' ');

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function askTeacher(history: ChatTurn[]): Promise<string> {
  const messages: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...history];
  try {
    const text = await askOpenRouterChat(messages, 500);
    return text || 'No obtuve respuesta esta vez. Probá de nuevo.';
  } catch (err) {
    return `No se pudo conectar con el profesor: ${err instanceof Error ? err.message : 'error desconocido'}`;
  }
}
