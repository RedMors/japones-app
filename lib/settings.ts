import fs from 'node:fs';
import path from 'node:path';

/**
 * Guarda la key de OpenRouter en .env.local (ya gitignoreado, ver
 * .gitignore) en vez de en data/app.db, que SÍ se versiona en git — nunca
 * debe terminar ahí un secreto.
 *
 * Requiere reiniciar `npm run dev` después de guardar: Next.js solo lee
 * process.env al arrancar el proceso, no en cada request.
 */

const ENV_PATH = path.join(process.cwd(), '.env.local');
const KEY_RE = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;

function readEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_PATH)) return {};
  const env: Record<string, string> = {};
  for (const line of fs.readFileSync(ENV_PATH, 'utf-8').split('\n')) {
    const match = line.match(KEY_RE);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

/**
 * Actualiza solo las líneas de las keys pasadas, línea por línea, sin tocar
 * el resto del archivo (comentarios, otras variables, formato). Reconstruir
 * el archivo entero a partir de un dict —como hacía la versión anterior—
 * borraba en silencio cualquier línea que esa lectura no supiera parsear
 * (comentarios, `export FOO=bar`, valores con comillas).
 */
function upsertEnvFile(updates: Record<string, string>): void {
  const lines = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8').split('\n') : [];
  const pending = new Map(Object.entries(updates));

  const updatedLines = lines.map((line) => {
    const match = line.match(KEY_RE);
    if (match && pending.has(match[1])) {
      const key = match[1];
      const value = pending.get(key)!;
      pending.delete(key);
      return `${key}=${value}`;
    }
    return line;
  });

  // Las que no existían todavía se agregan al final.
  for (const [key, value] of pending) updatedLines.push(`${key}=${value}`);

  // Sin línea en blanco final duplicada si el archivo ya terminaba en '\n'.
  while (updatedLines.length > 1 && updatedLines.at(-1) === '') updatedLines.pop();

  fs.writeFileSync(ENV_PATH, updatedLines.join('\n') + '\n', { mode: 0o600 });
}

export function isOpenRouterKeyConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY || readEnvFile().OPENROUTER_API_KEY);
}

export function getConfiguredModel(): string | undefined {
  return process.env.OPENROUTER_MODEL || readEnvFile().OPENROUTER_MODEL;
}

export function saveOpenRouterSettings(apiKey: string, model: string): void {
  const updates: Record<string, string> = {};
  if (apiKey.trim()) updates.OPENROUTER_API_KEY = apiKey.trim();
  if (model.trim()) updates.OPENROUTER_MODEL = model.trim();
  if (Object.keys(updates).length === 0) return;

  upsertEnvFile(updates);
  // Refleja el cambio en este proceso sin esperar el reinicio, para que el
  // primer llamado a la IA después de guardar ya funcione.
  if (apiKey.trim()) process.env.OPENROUTER_API_KEY = apiKey.trim();
  if (model.trim()) process.env.OPENROUTER_MODEL = model.trim();
}
