/**
 * Cliente mínimo de OpenRouter. Server-only (usa OPENROUTER_API_KEY) — nunca
 * importar desde un Client Component. Único punto de la app que sale a
 * internet además de AnkiConnect (que es local); rompe a propósito la
 * propiedad "cero cloud" del resto de la app, solo para esto.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Modelo barato por defecto. Si OpenRouter lo deprecó, poné otro id vigente
// (ver openrouter.ai/models) en OPENROUTER_MODEL en vez de tocar este archivo.
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function askOpenRouterChat(
  messages: ChatMessage[],
  maxTokens = 350,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Falta OPENROUTER_API_KEY en .env.local');
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
    }),
    // Sin esto, un OpenRouter/red colgada deja el botón "Pensando..." girando
    // para siempre — la Server Action nunca resuelve ni rechaza.
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

export async function askOpenRouter(userPrompt: string): Promise<string> {
  return askOpenRouterChat([{ role: 'user', content: userPrompt }]);
}
