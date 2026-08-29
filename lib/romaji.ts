/**
 * Hiragana -> romaji, aproximado (Hepburn simplificado). Reusa las mismas
 * tablas del curriculum (lib/curriculum/kana-data.ts) para no duplicar la
 * fuente de verdad de qué kana suena cómo.
 *
 * No maneja el matiz de ん->m antes de b/m/p (Hepburn estricto); usa "n"
 * siempre. Suficiente para "cómo se pronuncia más o menos", no para
 * romanización oficial de documentos.
 */
import { HIRAGANA, HIRAGANA_AVANZADO } from './curriculum/kana-data.ts';

const KANA_TO_ROMAJI = new Map<string, string>();
for (const k of [...HIRAGANA, ...HIRAGANA_AVANZADO]) {
  KANA_TO_ROMAJI.set(k.char, k.romaji);
}

const CONSONANT_RE = /^[bcdfghjklmnpqrstvwxyz]/;
const VOWEL_RE = /^[aiueo]$/;

function matchAt(text: string, i: number): { romaji: string; length: number } | null {
  const two = text.slice(i, i + 2);
  if (KANA_TO_ROMAJI.has(two)) return { romaji: KANA_TO_ROMAJI.get(two)!, length: 2 };
  const one = text[i];
  if (KANA_TO_ROMAJI.has(one)) return { romaji: KANA_TO_ROMAJI.get(one)!, length: 1 };
  return null;
}

export function hiraganaToRomaji(input: string): string {
  let result = '';
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (char === 'っ') {
      // Sokuon: duplica la consonante inicial de la sílaba siguiente.
      const next = matchAt(input, i + 1);
      if (next && CONSONANT_RE.test(next.romaji)) result += next.romaji[0];
      i += 1;
      continue;
    }

    if (char === 'ー') {
      // Alargamiento (usual en préstamos): repite la última vocal.
      const lastChar = result.slice(-1);
      if (VOWEL_RE.test(lastChar)) result += lastChar;
      i += 1;
      continue;
    }

    const match = matchAt(input, i);
    if (match) {
      result += match.romaji;
      i += match.length;
      continue;
    }

    // Kanji que se coló, puntuación, espacio: se deja tal cual.
    result += char;
    i += 1;
  }

  return result;
}
