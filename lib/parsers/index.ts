import crypto from 'node:crypto';
import path from 'node:path';
import { parseSrt } from './srt.ts';
import { parseAss } from './ass.ts';
import type { ParsedSubtitles, ParseOptions, SubtitleFormat } from './types.ts';

export type { SubtitleLine, ParsedSubtitles, ParseOptions, SubtitleFormat } from './types.ts';
export { parseSrt } from './srt.ts';
export { parseAss } from './ass.ts';

/**
 * Muchos .srt de anime vienen en Shift-JIS, no en UTF-8. Decodificarlos mal
 * produce mojibake que el tokenizer procesa igual, sin fallar, generando
 * tarjetas con basura. Se detecta el encoding antes de tocar el texto.
 */
export function decodeSubtitleBuffer(buffer: Uint8Array): string {
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buffer);
  }
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buffer);
  }

  const utf8 = new TextDecoder('utf-8').decode(buffer);
  // El carácter de reemplazo delata que no era UTF-8.
  if (!utf8.includes('�')) return utf8.replace(/^﻿/, '');

  for (const encoding of ['shift_jis', 'euc-jp', 'iso-2022-jp']) {
    try {
      return new TextDecoder(encoding, { fatal: true })
        .decode(buffer)
        .replace(/^﻿/, '');
    } catch {
      // probamos el siguiente
    }
  }
  return utf8.replace(/^﻿/, '');
}

export function detectFormat(filename: string, content: string): SubtitleFormat {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.ass' || ext === '.ssa') return 'ass';
  if (ext === '.srt') return 'srt';
  // Sin extensión confiable, decide el contenido.
  return /^\s*\[script info\]/im.test(content) || /^\s*dialogue:/im.test(content)
    ? 'ass'
    : 'srt';
}

export function parseSubtitles(
  filename: string,
  content: string,
  options: ParseOptions = {},
): ParsedSubtitles {
  return detectFormat(filename, content) === 'ass'
    ? parseAss(content, options)
    : parseSrt(content, options);
}

/** Identidad del archivo, para no procesar el mismo episodio dos veces. */
export function hashContent(input: Uint8Array | string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 32);
}

export type EpisodeMeta = {
  animeName: string;
  episodeLabel: string | null;
};

const EPISODE_PATTERNS: RegExp[] = [
  /\bS(\d{1,2})\s*E(\d{1,3})\b/i,
  /\b(?:episode|episodio|ep)[\s._-]*(\d{1,3})\b/i,
  /\s-\s(\d{1,3})(?:v\d)?\b/,
  /[\s._-](\d{1,3})(?:v\d)?\s*$/,
];

/**
 * Adivina serie y episodio desde el nombre del archivo para que no tengas que
 * escribirlos. Se puede corregir en la UI; el punto es que el caso normal sean
 * cero campos que llenar.
 */
export function guessEpisodeMeta(filename: string): EpisodeMeta {
  const base = path.basename(filename, path.extname(filename));

  // Fuera el grupo de fansub y los datos técnicos: [SubsPlease], (1080p), [A1B2]
  const stripped = base
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const pattern of EPISODE_PATTERNS) {
    const match = pattern.exec(stripped);
    if (!match) continue;

    const isSeasonEpisode = match.length > 2 && match[2] !== undefined;
    const episodeLabel = isSeasonEpisode
      ? `S${match[1].padStart(2, '0')}E${match[2].padStart(2, '0')}`
      : `E${match[1].padStart(2, '0')}`;

    const name = cleanName(stripped.slice(0, match.index));
    if (name) return { animeName: name, episodeLabel };
  }

  return { animeName: cleanName(stripped) || base, episodeLabel: null };
}

function cleanName(value: string): string {
  return value
    .replace(/[._]+/g, ' ')
    .replace(/[\s\-–—]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
