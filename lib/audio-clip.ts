/**
 * Recorta clips de audio cortos (una oración minada) de un archivo de video
 * o audio fuente, vía el `ffmpeg` del sistema. No queda otra dependencia:
 * si no está instalado, mineEpisode() simplemente sigue sin clips (ver
 * isFfmpegAvailable) en vez de romper el minado entero.
 *
 * A propósito NO se guarda el archivo fuente completo (puede ser un video de
 * cientos de MB): se extrae cada clip necesario y se borra el original.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CLIPS_DIR = path.join(process.cwd(), 'data', 'clips');
const PADDING_MS = 150; // un pelín antes/después: subtítulos suelen cortar justo

let ffmpegAvailable: boolean | undefined;

export async function isFfmpegAvailable(): Promise<boolean> {
  if (ffmpegAvailable !== undefined) return ffmpegAvailable;
  ffmpegAvailable = await new Promise<boolean>((resolve) => {
    const proc = spawn('ffmpeg', ['-version']);
    proc.on('error', () => resolve(false));
    proc.on('exit', (code) => resolve(code === 0));
  });
  return ffmpegAvailable;
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg salió con código ${code}: ${stderr.slice(-500)}`));
    });
  });
}

/**
 * Extrae [startMs, endMs] de `sourcePath` como mp3 mono de bitrate bajo
 * (suficiente para repasar pronunciación, no para escuchar música) y lo
 * guarda en data/clips/{episodeId}/{clipId}.mp3. Devuelve la ruta relativa
 * guardada en DB (no la absoluta: el proyecto se puede mover de carpeta).
 */
export async function extractClip(
  sourcePath: string,
  episodeId: number,
  clipId: string,
  startMs: number,
  endMs: number,
): Promise<string> {
  const dir = path.join(CLIPS_DIR, String(episodeId));
  fs.mkdirSync(dir, { recursive: true });

  const relPath = path.join('data', 'clips', String(episodeId), `${clipId}.mp3`);
  const absPath = path.join(process.cwd(), relPath);

  const start = Math.max(0, startMs - PADDING_MS) / 1000;
  const durationMs = endMs - startMs + PADDING_MS * 2;

  await runFfmpeg([
    '-y',
    '-ss', String(start),
    '-i', sourcePath,
    '-t', String(Math.max(0.2, durationMs / 1000)),
    '-vn',
    '-ac', '1',
    '-b:a', '48k',
    absPath,
  ]);

  return relPath;
}

export function clipAbsolutePath(relPath: string): string {
  return path.join(process.cwd(), relPath);
}

export function deleteEpisodeClips(episodeId: number): void {
  const dir = path.join(CLIPS_DIR, String(episodeId));
  fs.rmSync(dir, { recursive: true, force: true });
}
