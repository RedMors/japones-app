import { katakanaToHiragana } from '../normalize.ts';
import { hiraganaToRomajiSegments, type RomajiSegment } from '../romaji.ts';

export type { RomajiSegment };

/**
 * Alinea romaji por mora sobre un texto en kana (hiragana o katakana),
 * como Duolingo — no un romaji por caracter suelto, sino por SONIDO: yōon
 * (きゃ) es una sola mora ("kya", no "ki"+"ya"), っ dobla la consonante
 * siguiente en vez de mostrarse solo, ー alarga la vocal de la mora
 * anterior. Reusa `hiraganaToRomajiSegments` (misma fuente de verdad que
 * `/buscar`, no una segunda tabla de sokuon/yōon por separado) — el
 * katakana se convierte a hiragana solo para esa lectura interna; lo que
 * se muestra son los caracteres ORIGINALES, tomando el mismo largo de
 * segmento que calculó la versión en hiragana.
 */
export function alignRomaji(text: string): RomajiSegment[] {
  const hiraSegments = hiraganaToRomajiSegments(katakanaToHiragana(text));
  const original = Array.from(text);
  const segments: RomajiSegment[] = [];
  let cursor = 0;

  for (const seg of hiraSegments) {
    const len = Array.from(seg.chars).length;
    segments.push({ chars: original.slice(cursor, cursor + len).join(''), romaji: seg.romaji });
    cursor += len;
  }

  return segments;
}
