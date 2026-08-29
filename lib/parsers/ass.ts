import { containsJapanese, decodeEntities } from '../normalize.ts';
import type { ParsedSubtitles, ParseOptions, SubtitleLine } from './types.ts';

/** 0:00:01.23 — horas de un dígito, centésimas de segundo. */
const ASS_TIME_RE = /^(\d+):(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/;

/**
 * Estilos que no son diálogo: carteles traducidos, karaoke de opening y ending,
 * créditos. Minarlos llena el episodio de ruido que nunca se escuchó.
 */
const NON_DIALOGUE_STYLE_RE = /(sign|karaoke|credit|title|logo|caption|note)/i;
const OP_ED_STYLE_RE = /^\s*(op|ed|opening|ending)\b/i;

function parseAssTime(value: string): number | null {
  const match = ASS_TIME_RE.exec(value.trim());
  if (!match) return null;
  // El campo son centésimas, no milésimas: "23" es 230ms.
  const fraction = Number(match[4].padEnd(2, '0').slice(0, 2)) * 10;
  return (
    Number(match[1]) * 3_600_000 +
    Number(match[2]) * 60_000 +
    Number(match[3]) * 1_000 +
    fraction
  );
}

/** ¿El texto es un dibujo vectorial en vez de palabras? */
function isDrawing(text: string): boolean {
  return /\{[^}]*\\p[1-9]/.test(text);
}

function hasKaraoke(text: string): boolean {
  return /\{[^}]*\\[kK][fo]?\d/.test(text);
}

export function cleanAssText(raw: string): string {
  const withoutOverrides = raw
    // Bloques de override: {\an8}, {\pos(…)}, {\c&HFFFFFF&}
    .replace(/\{[^}]*\}/g, '')
    // Saltos de línea propios del formato
    .replace(/\\[Nn]/g, '\n')
    // Espacio duro
    .replace(/\\h/g, ' ');

  const decoded = decodeEntities(withoutOverrides)
    .replace(/^\s*[-–—]\s*/gm, '')
    .trim();

  if (!decoded) return '';

  const joiner = containsJapanese(decoded) ? '' : ' ';
  return decoded
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(joiner)
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function parseAss(content: string, options: ParseOptions = {}): ParsedSubtitles {
  const requireJapanese = options.requireJapanese ?? true;

  const rows = content.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');

  let inEvents = false;
  let format: string[] | null = null;

  const lines: SubtitleLine[] = [];
  let totalCues = 0;
  let droppedNonJapanese = 0;
  const seen = new Set<string>();

  for (const row of rows) {
    const trimmed = row.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('[')) {
      inEvents = /^\[events\]/i.test(trimmed);
      format = null;
      continue;
    }
    if (!inEvents) continue;

    const separator = trimmed.indexOf(':');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim().toLowerCase();
    const rest = trimmed.slice(separator + 1);

    if (key === 'format') {
      // El orden de los campos lo define el archivo, no el estándar.
      format = rest.split(',').map((f) => f.trim().toLowerCase());
      continue;
    }
    // "Comment:" son líneas desactivadas por el traductor.
    if (key !== 'dialogue') continue;
    if (!format) continue;

    const startIdx = format.indexOf('start');
    const endIdx = format.indexOf('end');
    const textIdx = format.indexOf('text');
    if (startIdx === -1 || endIdx === -1 || textIdx === -1) continue;

    // Text es siempre el último campo y puede contener comas: se corta solo
    // hasta la cantidad de campos declarada y el resto queda entero.
    const parts = rest.split(',');
    if (parts.length < format.length) continue;
    const fields = parts.slice(0, format.length - 1).map((p) => p.trim());
    fields.push(parts.slice(format.length - 1).join(','));

    const startMs = parseAssTime(fields[startIdx]);
    const endMs = parseAssTime(fields[endIdx]);
    if (startMs === null || endMs === null) continue;

    const rawText = fields[textIdx];
    if (isDrawing(rawText) || hasKaraoke(rawText)) continue;

    const styleIdx = format.indexOf('style');
    const style = styleIdx !== -1 ? fields[styleIdx] : '';
    if (style && (NON_DIALOGUE_STYLE_RE.test(style) || OP_ED_STYLE_RE.test(style))) continue;

    const text = cleanAssText(rawText);
    if (!text) continue;

    totalCues++;

    if (requireJapanese && !containsJapanese(text)) {
      droppedNonJapanese++;
      continue;
    }

    // Los .ass repiten la misma línea en varias capas para efectos visuales.
    const key2 = `${startMs}|${text}`;
    if (seen.has(key2)) continue;
    seen.add(key2);

    lines.push({ index: lines.length, startMs, endMs, text });
  }

  lines.sort((a, b) => a.startMs - b.startMs);
  lines.forEach((line, i) => (line.index = i));

  return { format: 'ass', lines, totalCues, droppedNonJapanese };
}
