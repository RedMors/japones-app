/**
 * Generación de imágenes vía OpenRouter (/api/v1/images) — server-only,
 * mismo OPENROUTER_API_KEY que lib/openrouter.ts. A diferencia del texto,
 * esto cuesta plata real por imagen — por eso SIEMPRE se llama a través de
 * lib/image-cache.ts, nunca directo, para no regenerar lo mismo dos veces.
 */
const OPENROUTER_IMAGES_URL = 'https://openrouter.ai/api/v1/images';

// Modelo barato, salida tipo ícono plano — no fotorrealista, no hace falta
// para este uso. Configurable por si OpenRouter lo deprecara.
const DEFAULT_IMAGE_MODEL = 'recraft/recraft-v4-styles';

export type GeneratedImage = { base64: string; mediaType: string };

export async function generateImage(prompt: string): Promise<GeneratedImage> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Falta OPENROUTER_API_KEY en .env.local');
  }

  const res = await fetch(OPENROUTER_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
      prompt,
      n: 1,
      output_format: 'png',
    }),
    // Generar imagen tarda más que texto — 45s de margen antes de rendirse.
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter (imágenes) ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    data?: { b64_json?: string; media_type?: string }[];
  };
  const image = data.data?.[0];
  if (!image?.b64_json) throw new Error('OpenRouter no devolvió ninguna imagen.');

  return { base64: image.b64_json, mediaType: image.media_type || 'image/png' };
}
