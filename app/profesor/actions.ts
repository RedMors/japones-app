'use server';

import { askOpenRouterChat, type ChatMessage } from '@/lib/openrouter';
import type { Lang } from '@/lib/i18n/dictionary';

const SYSTEM_PROMPT_ES = [
  'Sos un profesor de japonés paciente y claro, dando clases particulares a un',
  'estudiante hispanohablante que recién arranca (nivel principiante, N5-N4).',
  'Respondé siempre en español. Cuando escribas japonés, poné la lectura en',
  'hiragana entre paréntesis al lado de cada palabra con kanji, ej: 食べる(たべる).',
  'Explicá con ejemplos simples antes que con reglas abstractas. Si la duda',
  'es ambigua, hacé como máximo una pregunta aclaratoria antes de responder.',
  'Sé breve: 3-5 oraciones salvo que el estudiante pida más detalle.',
].join(' ');

const SYSTEM_PROMPT_EN = [
  'You are a patient, clear Japanese teacher giving private lessons to an',
  'English-speaking student who just started (beginner level, N5-N4).',
  'Always answer in English. When you write Japanese, put the reading in',
  'hiragana in parentheses next to each kanji word, e.g. 食べる(たべる).',
  'Explain with simple examples before abstract rules. If the question is',
  'ambiguous, ask at most one clarifying question before answering.',
  'Be brief: 3-5 sentences unless the student asks for more detail.',
].join(' ');

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function askTeacher(history: ChatTurn[], lang: Lang = 'es'): Promise<string> {
  const systemPrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES;
  const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...history];
  try {
    const text = await askOpenRouterChat(messages, 500);
    if (text) return text;
    return lang === 'en' ? 'No response this time. Try again.' : 'No obtuve respuesta esta vez. Probá de nuevo.';
  } catch (err) {
    const message = err instanceof Error ? err.message : lang === 'en' ? 'unknown error' : 'error desconocido';
    return lang === 'en'
      ? `Could not connect to the teacher: ${message}`
      : `No se pudo conectar con el profesor: ${message}`;
  }
}
