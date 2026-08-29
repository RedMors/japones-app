/**
 * Furigana inline: "私[わたし]は学生[がくせい]です。" -> segmentos para
 * renderizar con <ruby><rt>. Mismo formato que usa el addon Japanese
 * Support de Anki, así que el contenido se escribe igual que en una tarjeta.
 *
 * Sin esto, una oración con kanji no tiene forma de saber cómo se lee sin
 * ya sabértela de memoria — que es exactamente lo que Duolingo muestra
 * arriba de cada carácter y lo que faltaba acá.
 */
export type FuriganaSegment = { text: string; reading?: string };

/**
 * El texto capturado tiene que EMPEZAR en kanji (puede seguir con hiragana
 * hasta el corchete, para palabras enteras tipo "安っぽい[やすっぽい]"),
 * nunca empezar en hiragana. Con `[^\s\[\]]+\[...\]` una partícula suelta
 * justo antes de un kanji con furigana ("は学生[がくせい]") quedaba
 * tragada dentro de la lectura de 学生, como si "は" también se leyera
 * "がくせい". Al exigir que el primer carácter capturado sea kanji, el
 * motor de regex no puede empezar el match en "は" y lo deja afuera.
 */
const FURIGANA_RE = /([一-鿿㐀-䶿々][一-鿿㐀-䶿々぀-ゟァ-ヺー]*)\[([^\[\]]+)\]/g;

export function parseFurigana(input: string): FuriganaSegment[] {
  const segments: FuriganaSegment[] = [];
  let cursor = 0;

  for (const match of input.matchAll(FURIGANA_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ text: input.slice(cursor, index) });
    segments.push({ text: match[1], reading: match[2] });
    cursor = index + match[0].length;
  }
  if (cursor < input.length) segments.push({ text: input.slice(cursor) });

  return segments;
}

/** Largo visible real, sin los corchetes de furigana — para decidir tamaño de fuente. */
export function stripFurigana(input: string): string {
  return parseFurigana(input)
    .map((s) => s.text)
    .join('');
}

/** Envuelve un lema con su lectura en formato furigana, si corresponde. */
export function withFurigana(word: string, reading: string | null): string {
  if (!reading || reading === word) return word;
  return `${word}[${reading}]`;
}
