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

/**
 * Cada trozo de la entrada junto con su romaji — `romaji` es `null` cuando
 * ese trozo no tiene sonido propio para mostrar (ej. っ que no pudo doblar
 * ninguna consonante, o un caracter que no es kana). Para texto plano
 * (`hiraganaToRomaji`) esos casos se resuelven distinto según el caso — ver
 * ahí — por eso el segmento no asume una sola forma de "aplanarse".
 */
export type RomajiSegment = { chars: string; romaji: string | null };

export function hiraganaToRomajiSegments(input: string): RomajiSegment[] {
  const segments: RomajiSegment[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (char === 'っ') {
      // Sokuon: duplica la consonante inicial de la sílaba siguiente.
      const next = matchAt(input, i + 1);
      if (next && CONSONANT_RE.test(next.romaji)) {
        segments.push({
          chars: char + input.slice(i + 1, i + 1 + next.length),
          romaji: next.romaji[0] + next.romaji,
        });
        i += 1 + next.length;
      } else {
        segments.push({ chars: char, romaji: null });
        i += 1;
      }
      continue;
    }

    if (char === 'ー') {
      // Alargamiento (usual en préstamos): repite la última vocal.
      const prev = segments[segments.length - 1];
      const lastVowel = prev?.romaji?.slice(-1) ?? '';
      if (VOWEL_RE.test(lastVowel)) {
        segments[segments.length - 1] = { chars: prev.chars + char, romaji: prev.romaji + lastVowel };
      } else {
        segments.push({ chars: char, romaji: null });
      }
      i += 1;
      continue;
    }

    const match = matchAt(input, i);
    if (match) {
      segments.push({ chars: input.slice(i, i + match.length), romaji: match.romaji });
      i += match.length;
      continue;
    }

    // Kanji que se coló, puntuación, espacio: se deja tal cual, sin romaji.
    segments.push({ chars: char, romaji: null });
    i += 1;
  }

  return segments;
}

export function hiraganaToRomaji(input: string): string {
  return hiraganaToRomajiSegments(input)
    .map((s) => {
      if (s.romaji !== null) return s.romaji;
      // っ o ー que no pudieron aplicarse (sin consonante/vocal válida
      // después): se omiten en vez de mostrarse crudos, igual que antes.
      if (s.chars === 'っ' || s.chars === 'ー') return '';
      return s.chars;
    })
    .join('');
}
