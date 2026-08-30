/**
 * Caché en disco para imágenes generadas por IA: cada prompt se genera UNA
 * sola vez (cuesta plata real por llamada a OpenRouter), después siempre se
 * sirve desde acá. Mismo patrón que data/clips/ (audio) — gitignoreado,
 * son archivos generados, no contenido versionado.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { generateImage } from './openrouter-images.ts';

const IMAGES_DIR = path.join(process.cwd(), 'data', 'images');

function keyFor(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 24);
}

function extFor(mediaType: string): string {
  if (mediaType.includes('svg')) return 'svg';
  if (mediaType.includes('jpeg') || mediaType.includes('jpg')) return 'jpg';
  return 'png';
}

/**
 * Devuelve la key de caché para un prompt, generando la imagen si todavía
 * no existe. La key (no la imagen en sí) es lo que se guarda/pasa al
 * cliente — la imagen se sirve después vía /api/scene-image/[key].
 */
export async function getOrGenerateImageKey(prompt: string): Promise<string> {
  const key = keyFor(prompt);
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const existing = ['png', 'jpg', 'svg']
    .map((ext) => `${key}.${ext}`)
    .find((name) => fs.existsSync(path.join(IMAGES_DIR, name)));
  if (existing) return key;

  const image = await generateImage(prompt);
  const ext = extFor(image.mediaType);
  fs.writeFileSync(path.join(IMAGES_DIR, `${key}.${ext}`), Buffer.from(image.base64, 'base64'));
  return key;
}

export function findCachedImage(key: string): { path: string; mediaType: string } | null {
  for (const [ext, mediaType] of [
    ['png', 'image/png'],
    ['jpg', 'image/jpeg'],
    ['svg', 'image/svg+xml'],
  ] as const) {
    const p = path.join(IMAGES_DIR, `${key}.${ext}`);
    if (fs.existsSync(p)) return { path: p, mediaType };
  }
  return null;
}
