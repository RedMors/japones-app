import { containsJapanese, decodeEntities } from '../normalize.ts';
import type { ParsedSubtitles, ParseOptions, SubtitleLine } from './types.ts';

/**
 * Acepta coma o punto como separador de milisegundos: hay archivos con ambos.
 * Las coordenadas de posición (X1:… Y1:…) que algunos .srt agregan al final
 * de la línea de tiempo se ignoran solas al no capturarlas.
 */
const TIMECODE_RE =
  /^\s*(\d{1,3}):(\d{1,2}):(\d{1,2})[,.](\d{1,3})\s*-->\s*(\d{1,3}):(\d{1,2}):(\d{1,2})[,.](\d{1,3})/;

const ONLY_DIGITS_RE = /^\s*\d+\s*$/;

function toMs(h: string, m: string, s: string, frac: string): number {
  // "5" en el campo de milisegundos son 500ms, no 5ms.
  const ms = Number(frac.padEnd(3, '0').slice(0, 3));
  return Number(h) * 3_600_000 + Number(m) * 60_000 + Number(s) * 1_000 + ms;
}

/** Limpia el texto de un cue: tags HTML, overrides sueltos, guiones de diálogo. */
export function cleanSrtText(raw: string[]): string {
  const cleaned = raw
    .map((line) =>
      line
        // <i>, <b>, <font color="#fff">, </font>…
        .replace(/<[^>]*>/g, '')
        // Overrides de ASS que a veces se cuelan en .srt: {\an8}, {\pos(…)}
        .replace(/\{[^}]*\}/g, '')
        // Guion de diálogo al inicio de línea
        .replace(/^\s*[-–—]\s*/, '')
        .trim(),
    )
    .filter((line) => line.length > 0);

  if (cleaned.length === 0) return '';

  const text = cleaned.join('\n');
  const decoded = decodeEntities(text);

  // El japonés parte líneas por estética, no por palabras: unirlas con espacio
  // metería un corte falso en medio de una oración.
  const joiner = containsJapanese(decoded) ? '' : ' ';
  return decoded.split('\n').join(joiner).replace(/[ \t]+/g, ' ').trim();
}

export function parseSrt(content: string, options: ParseOptions = {}): ParsedSubtitles {
  const requireJapanese = options.requireJapanese ?? true;

  const rows = content.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');

  // Primero se ubican todas las líneas de tiempo. Partir por líneas en blanco
  // es frágil: hay archivos con blancos dentro de un mismo cue y con los
  // números de índice ausentes o repetidos.
  const timecodeRows: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (TIMECODE_RE.test(rows[i])) timecodeRows.push(i);
  }

  const lines: SubtitleLine[] = [];
  let totalCues = 0;
  let droppedNonJapanese = 0;
  let lastText = '';

  for (let c = 0; c < timecodeRows.length; c++) {
    const row = timecodeRows[c];
    const match = TIMECODE_RE.exec(rows[row]);
    if (!match) continue;

    const startMs = toMs(match[1], match[2], match[3], match[4]);
    const endMs = toMs(match[5], match[6], match[7], match[8]);

    const nextRow = c + 1 < timecodeRows.length ? timecodeRows[c + 1] : rows.length;
    const body = rows.slice(row + 1, nextRow);

    // La última fila antes del próximo cue suele ser su número de índice.
    while (body.length > 0 && body[body.length - 1].trim() === '') body.pop();
    if (body.length > 0 && ONLY_DIGITS_RE.test(body[body.length - 1])) body.pop();

    const text = cleanSrtText(body);
    if (!text) continue;

    totalCues++;

    if (requireJapanese && !containsJapanese(text)) {
      droppedNonJapanese++;
      continue;
    }
    // Los subtítulos repiten la misma línea en cues seguidos más de lo que
    // parece; minarla dos veces no aporta nada.
    if (text === lastText) continue;
    lastText = text;

    lines.push({ index: lines.length, startMs, endMs, text });
  }

  return { format: 'srt', lines, totalCues, droppedNonJapanese };
}
