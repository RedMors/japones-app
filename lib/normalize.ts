/**
 * Normalización de texto japonés.
 *
 * Este archivo es el punto más crítico de la app: si la normalización falla,
 * el vocabulario que ya dominás no matchea contra lo que sale del tokenizer y
 * cada episodio te muestra palabras conocidas como "nuevas". Y falla en silencio,
 * sin tirar ningún error.
 *
 * Los campos de Anki traen HTML, furigana estilo 漢字[かんじ], entidades,
 * cloze, [sound:...] y ancho completo. Todo eso se limpia acá, del mismo modo
 * en ambos lados de la comparación.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  middot: '·',
};

/** Rangos de kana y kanji. Incluye katakana de ancho medio (ﾊﾝｶｸ). */
const JAPANESE_RE = /[぀-ゟ゠-ヿ㐀-䶿一-鿿ｦ-ﾝ]/;

const TRIM_CHARS = '\\s「」『』【】（）()\\[\\]"\'“”‘’・･…\\-–—';
const TRIM_RE = new RegExp(`^[${TRIM_CHARS}]+|[${TRIM_CHARS}]+$`, 'g');

export function decodeEntities(input: string): string {
  return input.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body.startsWith('#')) {
      const isHex = body[1] === 'x' || body[1] === 'X';
      const code = isHex ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/**
 * Quita HTML. El orden importa: <rt> (la lectura de un <ruby>) se elimina con
 * su contenido, si no la lectura quedaría pegada a la palabra base.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(rt|rp)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*(div|p|li|tr|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '');
}

/** Cloze de Anki, tags de audio y de imagen que no son HTML. */
export function stripAnkiMarkup(input: string): string {
  return input
    .replace(/\{\{c\d+::([\s\S]*?)(?:::[\s\S]*?)?\}\}/g, '$1')
    .replace(/\[sound:[^\]]*\]/gi, '')
    .replace(/\[anki:[^\]]*\]/gi, '');
}

/**
 * Separa furigana del addon Japanese Support: `私[わたし]は 学生[がくせい]です`
 * devuelve text `私は学生です` y reading `わたしはがくせいです`.
 * Si no hay furigana, reading es null.
 */
export function splitFurigana(input: string): { text: string; reading: string | null } {
  const re = /([^\s\[\]]*)\[([^\[\]]*)\]/g;
  let base = '';
  let reading = '';
  let cursor = 0;
  let found = false;

  for (const match of input.matchAll(re)) {
    const index = match.index ?? 0;
    const before = input.slice(cursor, index);
    // El addon mete un espacio separador antes del bloque con lectura.
    base += before.replace(/\s+$/, '');
    reading += before;
    base += match[1];
    reading += match[2];
    cursor = index + match[0].length;
    found = true;
  }

  if (!found) return { text: input, reading: null };

  const tail = input.slice(cursor);
  base += tail;
  reading += tail;

  return {
    text: base.trim(),
    reading: reading.replace(/\s+/g, '').trim() || null,
  };
}

/** NFKC (ancho completo -> normal) y limpieza de caracteres invisibles. */
export function normalizeText(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[​-‍﻿]/g, '')
    .replace(/ /g, ' ');
}

export function containsJapanese(input: string): boolean {
  return JAPANESE_RE.test(input);
}

/**
 * Katakana -> hiragana. kuromoji devuelve las lecturas en katakana (タベル) pero
 * en una tarjeta se leen en hiragana (たべる).
 * Deja fuera ー, ・ y ヶ, que no tienen equivalente.
 */
export function katakanaToHiragana(input: string): string {
  return input.normalize('NFKC').replace(/[ァ-ヶ]/g, (char) => {
    const code = char.codePointAt(0)!;
    if (code === 0x30f6) return char; // ヶ
    return String.fromCodePoint(code - 0x60);
  });
}

export function hiraganaToKatakana(input: string): string {
  return input.normalize('NFKC').replace(/[ぁ-ゖ]/g, (char) =>
    String.fromCodePoint(char.codePointAt(0)! + 0x60),
  );
}

/** Solo kana: sirve para saber si una palabra necesita mostrar lectura aparte. */
export function isKanaOnly(input: string): boolean {
  return input.length > 0 && /^[ぁ-ゟ゠-ヿー]+$/.test(input);
}

const HAS_KANJI_RE = /[一-鿿㐀-䶿々]/;
const HAS_HIRAGANA_RE = /[ぁ-ゟ]/;
const HAS_KATAKANA_RE = /[゠-ヿ]/;

/** Con qué silabario está escrita una palabra — para mostrar "Hiragana" /
 *  "Katakana" junto a un ejemplo y que el que recién arranca sepa qué está
 *  mirando. `mixed` es kanji+kana (la mayoría del vocabulario real). */
export function scriptOf(input: string): 'hiragana' | 'katakana' | 'kanji' | 'mixed' {
  const hasKanji = HAS_KANJI_RE.test(input);
  const hasHiragana = HAS_HIRAGANA_RE.test(input);
  const hasKatakana = HAS_KATAKANA_RE.test(input);
  if (hasKanji) return hasHiragana || hasKatakana ? 'mixed' : 'kanji';
  if (hasKatakana && hasHiragana) return 'mixed';
  if (hasKatakana) return 'katakana';
  return 'hiragana';
}

/**
 * Campo crudo de Anki -> texto plano + lectura si venía en furigana.
 */
export function parseAnkiField(raw: string): { text: string; reading: string | null } {
  let s = stripHtml(raw);
  s = decodeEntities(s);
  s = stripAnkiMarkup(s);
  const { text, reading } = splitFurigana(s);
  return {
    text: normalizeText(text).replace(/[ \t]+/g, ' ').trim(),
    reading: reading ? normalizeText(reading).trim() : null,
  };
}

export function normalizeAnkiField(raw: string): string {
  return parseAnkiField(raw).text;
}

/**
 * Forma canónica de una palabra, la clave con la que se compara todo.
 * En japonés se quitan todos los espacios; en alfabeto latino se colapsan
 * y se pasa a minúscula.
 */
export function normalizeLemma(input: string): string {
  let s = normalizeText(input).trim();
  s = s.replace(TRIM_RE, '');
  s = s.replace(/[。、，,．.!！?？]+$/g, '');
  s = s.replace(TRIM_RE, '');
  if (containsJapanese(s)) return s.replace(/\s+/g, '');
  return s.replace(/\s+/g, ' ').toLowerCase();
}

/** Heurística para descartar campos que son oraciones, no vocabulario. */
export function looksLikeSentence(input: string): boolean {
  const s = input.trim();
  return s.length > 24 || /[。！？\n]/.test(s);
}

/**
 * Campo de vocabulario de Anki -> lista de lemas normalizados.
 * Un campo puede traer variantes: "見る、観る" o dos líneas.
 */
export function ankiFieldToLemmas(raw: string): string[] {
  const cleaned = normalizeAnkiField(raw);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const part of cleaned.split(/[\n\r、;；]+/)) {
    const lemma = normalizeLemma(part);
    if (!lemma || lemma.length > 40) continue;
    if (seen.has(lemma)) continue;
    seen.add(lemma);
    out.push(lemma);
  }
  return out;
}
