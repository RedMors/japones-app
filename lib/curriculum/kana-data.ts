/**
 * Los 46 caracteres básicos del gojūon (sin dakuten, handakuten ni combinados).
 * Contenido fijo, no depende de ningún archivo externo ni de internet.
 */
export type KanaChar = {
  /** Identidad estable del ítem, ej. "kana:hiragana:あ". No cambia entre versiones. */
  id: string;
  char: string;
  romaji: string;
  row: string; // fila del gojūon: a, ka, sa, ta, na, ha, ma, ya, ra, wa, n
};

const GOJUON: { char: string; romaji: string; row: string }[] = [
  { char: 'あ', romaji: 'a', row: 'a' },
  { char: 'い', romaji: 'i', row: 'a' },
  { char: 'う', romaji: 'u', row: 'a' },
  { char: 'え', romaji: 'e', row: 'a' },
  { char: 'お', romaji: 'o', row: 'a' },
  { char: 'か', romaji: 'ka', row: 'ka' },
  { char: 'き', romaji: 'ki', row: 'ka' },
  { char: 'く', romaji: 'ku', row: 'ka' },
  { char: 'け', romaji: 'ke', row: 'ka' },
  { char: 'こ', romaji: 'ko', row: 'ka' },
  { char: 'さ', romaji: 'sa', row: 'sa' },
  { char: 'し', romaji: 'shi', row: 'sa' },
  { char: 'す', romaji: 'su', row: 'sa' },
  { char: 'せ', romaji: 'se', row: 'sa' },
  { char: 'そ', romaji: 'so', row: 'sa' },
  { char: 'た', romaji: 'ta', row: 'ta' },
  { char: 'ち', romaji: 'chi', row: 'ta' },
  { char: 'つ', romaji: 'tsu', row: 'ta' },
  { char: 'て', romaji: 'te', row: 'ta' },
  { char: 'と', romaji: 'to', row: 'ta' },
  { char: 'な', romaji: 'na', row: 'na' },
  { char: 'に', romaji: 'ni', row: 'na' },
  { char: 'ぬ', romaji: 'nu', row: 'na' },
  { char: 'ね', romaji: 'ne', row: 'na' },
  { char: 'の', romaji: 'no', row: 'na' },
  { char: 'は', romaji: 'ha', row: 'ha' },
  { char: 'ひ', romaji: 'hi', row: 'ha' },
  { char: 'ふ', romaji: 'fu', row: 'ha' },
  { char: 'へ', romaji: 'he', row: 'ha' },
  { char: 'ほ', romaji: 'ho', row: 'ha' },
  { char: 'ま', romaji: 'ma', row: 'ma' },
  { char: 'み', romaji: 'mi', row: 'ma' },
  { char: 'む', romaji: 'mu', row: 'ma' },
  { char: 'め', romaji: 'me', row: 'ma' },
  { char: 'も', romaji: 'mo', row: 'ma' },
  { char: 'や', romaji: 'ya', row: 'ya' },
  { char: 'ゆ', romaji: 'yu', row: 'ya' },
  { char: 'よ', romaji: 'yo', row: 'ya' },
  { char: 'ら', romaji: 'ra', row: 'ra' },
  { char: 'り', romaji: 'ri', row: 'ra' },
  { char: 'る', romaji: 'ru', row: 'ra' },
  { char: 'れ', romaji: 're', row: 'ra' },
  { char: 'ろ', romaji: 'ro', row: 'ra' },
  { char: 'わ', romaji: 'wa', row: 'wa' },
  { char: 'を', romaji: 'wo', row: 'wa' },
  { char: 'ん', romaji: 'n', row: 'n' },
];

function toKatakana(hiragana: string): string {
  return hiragana.replace(/[ぁ-ゖ]/g, (c) => String.fromCodePoint(c.codePointAt(0)! + 0x60));
}

export const HIRAGANA: KanaChar[] = GOJUON.map((k) => ({
  id: `kana:hiragana:${k.char}`,
  char: k.char,
  romaji: k.romaji,
  row: k.row,
}));

export const KATAKANA: KanaChar[] = GOJUON.map((k) => ({
  id: `kana:katakana:${toKatakana(k.char)}`,
  char: toKatakana(k.char),
  romaji: k.romaji,
  row: k.row,
}));

/** Dakuten (゛) y handakuten (゜): が, ざ, だ, ば, ぱ y sus filas. */
const DAKUTEN: { char: string; romaji: string; row: string }[] = [
  { char: 'が', romaji: 'ga', row: 'ga' },
  { char: 'ぎ', romaji: 'gi', row: 'ga' },
  { char: 'ぐ', romaji: 'gu', row: 'ga' },
  { char: 'げ', romaji: 'ge', row: 'ga' },
  { char: 'ご', romaji: 'go', row: 'ga' },
  { char: 'ざ', romaji: 'za', row: 'za' },
  { char: 'じ', romaji: 'ji', row: 'za' },
  { char: 'ず', romaji: 'zu', row: 'za' },
  { char: 'ぜ', romaji: 'ze', row: 'za' },
  { char: 'ぞ', romaji: 'zo', row: 'za' },
  { char: 'だ', romaji: 'da', row: 'da' },
  { char: 'ぢ', romaji: 'ji', row: 'da' },
  { char: 'づ', romaji: 'zu', row: 'da' },
  { char: 'で', romaji: 'de', row: 'da' },
  { char: 'ど', romaji: 'do', row: 'da' },
  { char: 'ば', romaji: 'ba', row: 'ba' },
  { char: 'び', romaji: 'bi', row: 'ba' },
  { char: 'ぶ', romaji: 'bu', row: 'ba' },
  { char: 'べ', romaji: 'be', row: 'ba' },
  { char: 'ぼ', romaji: 'bo', row: 'ba' },
  { char: 'ぱ', romaji: 'pa', row: 'pa' },
  { char: 'ぴ', romaji: 'pi', row: 'pa' },
  { char: 'ぷ', romaji: 'pu', row: 'pa' },
  { char: 'ぺ', romaji: 'pe', row: 'pa' },
  { char: 'ぽ', romaji: 'po', row: 'pa' },
];

/** Yōon: sonidos contraídos (きゃ, しゃ, etc.) — fila i + や/ゆ/よ pequeña. */
const YOON: { char: string; romaji: string; row: string }[] = [
  { char: 'きゃ', romaji: 'kya', row: 'kya' },
  { char: 'きゅ', romaji: 'kyu', row: 'kya' },
  { char: 'きょ', romaji: 'kyo', row: 'kya' },
  { char: 'しゃ', romaji: 'sha', row: 'sha' },
  { char: 'しゅ', romaji: 'shu', row: 'sha' },
  { char: 'しょ', romaji: 'sho', row: 'sha' },
  { char: 'ちゃ', romaji: 'cha', row: 'cha' },
  { char: 'ちゅ', romaji: 'chu', row: 'cha' },
  { char: 'ちょ', romaji: 'cho', row: 'cha' },
  { char: 'にゃ', romaji: 'nya', row: 'nya' },
  { char: 'にゅ', romaji: 'nyu', row: 'nya' },
  { char: 'にょ', romaji: 'nyo', row: 'nya' },
  { char: 'ひゃ', romaji: 'hya', row: 'hya' },
  { char: 'ひゅ', romaji: 'hyu', row: 'hya' },
  { char: 'ひょ', romaji: 'hyo', row: 'hya' },
  { char: 'みゃ', romaji: 'mya', row: 'mya' },
  { char: 'みゅ', romaji: 'myu', row: 'mya' },
  { char: 'みょ', romaji: 'myo', row: 'mya' },
  { char: 'りゃ', romaji: 'rya', row: 'rya' },
  { char: 'りゅ', romaji: 'ryu', row: 'rya' },
  { char: 'りょ', romaji: 'ryo', row: 'rya' },
  { char: 'ぎゃ', romaji: 'gya', row: 'gya' },
  { char: 'ぎゅ', romaji: 'gyu', row: 'gya' },
  { char: 'ぎょ', romaji: 'gyo', row: 'gya' },
  { char: 'じゃ', romaji: 'ja', row: 'ja' },
  { char: 'じゅ', romaji: 'ju', row: 'ja' },
  { char: 'じょ', romaji: 'jo', row: 'ja' },
  { char: 'びゃ', romaji: 'bya', row: 'bya' },
  { char: 'びゅ', romaji: 'byu', row: 'bya' },
  { char: 'びょ', romaji: 'byo', row: 'bya' },
  { char: 'ぴゃ', romaji: 'pya', row: 'pya' },
  { char: 'ぴゅ', romaji: 'pyu', row: 'pya' },
  { char: 'ぴょ', romaji: 'pyo', row: 'pya' },
];

export const HIRAGANA_AVANZADO: KanaChar[] = [...DAKUTEN, ...YOON].map((k) => ({
  id: `kana:hiragana:${k.char}`,
  char: k.char,
  romaji: k.romaji,
  row: k.row,
}));

export const KATAKANA_AVANZADO: KanaChar[] = [...DAKUTEN, ...YOON].map((k) => ({
  id: `kana:katakana:${toKatakana(k.char)}`,
  char: toKatakana(k.char),
  romaji: k.romaji,
  row: k.row,
}));
