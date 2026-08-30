/**
 * Piloto: practicar una fila de kana (ej. さしすせそ) en oraciones cortas
 * reales, no sueltas — para reconocerla escuchando y tocando el caracter
 * correcto, no solo memorizarlo aislado. Mecánica tipo Duolingo "escuchá y
 * seleccioná": se escucha la oración completa, se arma tocando fichas de
 * kana en el orden que suenan (banco = fichas correctas + distractores),
 * cada ficha también suena sola al tocarla para poder verificar de oído
 * antes de confirmar.
 *
 * Curado a mano, mismo criterio que gramática y `/temas`: oraciones N5
 * reales (no inventadas), sin espacios entre palabras — el japonés no los
 * usa. No restringidas a "solo kana ya visto" (eso volvería todo artificial,
 * です mismo usa で, de la fila た); el criterio es que la fila objetivo
 * aparezca seguido, no que sea lo único presente.
 *
 * El pool de cada fila es más grande que una sesión (`SESSION_SIZE`) para
 * que "otra sesión" con la misma fila muestre una mezcla distinta, no
 * exactamente lo mismo.
 */

export type KanaSentence = {
  id: string;
  /** Oración en hiragana/katakana, sin kanji ni espacios — recién arrancando el silabario. */
  jp: string;
  /** Lectura en alfabeto latino. */
  reading: string;
  /** Traducción simple al español — se revela recién al confirmar. */
  translation: string;
};

export type KanaRowPractice = {
  /** Id de la fila, igual al `row` de kana-data.ts (ej. "sa"). */
  id: string;
  kind: 'hiragana' | 'katakana';
  /** Los caracteres de la fila, para mostrar en el título (ej. "さしすせそ"). */
  chars: string;
  sentences: KanaSentence[];
};

export const SESSION_SIZE = 8;

export const KANA_ROW_PRACTICE: KanaRowPractice[] = [
  {
    id: 'hiragana-sa',
    kind: 'hiragana',
    chars: 'さしすせそ',
    sentences: [
      { id: 'h1', jp: 'さかながすきです。', reading: 'sakana ga suki desu.', translation: 'Me gusta el pescado.' },
      { id: 'h2', jp: 'すしをたべます。', reading: 'sushi wo tabemasu.', translation: 'Como sushi.' },
      { id: 'h3', jp: 'あさです。', reading: 'asa desu.', translation: 'Es de mañana.' },
      { id: 'h4', jp: 'せんせいはやさしいです。', reading: 'sensei wa yasashii desu.', translation: 'El profesor es amable.' },
      { id: 'h5', jp: 'そらはあおいです。', reading: 'sora wa aoi desu.', translation: 'El cielo es azul.' },
      { id: 'h6', jp: 'すこしまってください。', reading: 'sukoshi matte kudasai.', translation: 'Espera un poco, por favor.' },
      { id: 'h7', jp: 'せかいはひろいです。', reading: 'sekai wa hiroi desu.', translation: 'El mundo es grande.' },
      { id: 'h8', jp: 'すいかはあまいです。', reading: 'suika wa amai desu.', translation: 'La sandía es dulce.' },
      { id: 'h9', jp: 'きのうはさむかったです。', reading: 'kinou wa samukatta desu.', translation: 'Ayer hizo frío.' },
      { id: 'h10', jp: 'しずかにしてください。', reading: 'shizuka ni shite kudasai.', translation: 'Guarda silencio, por favor.' },
      { id: 'h11', jp: 'さいふをなくしました。', reading: 'saifu wo nakushimashita.', translation: 'Perdí la billetera.' },
      { id: 'h12', jp: 'すずしいですね。', reading: 'suzushii desu ne.', translation: 'Qué fresco, ¿no?' },
    ],
  },
  {
    id: 'katakana-sa',
    kind: 'katakana',
    chars: 'サシスセソ',
    sentences: [
      { id: 'k1', jp: 'サラダをたべます。', reading: 'sarada wo tabemasu.', translation: 'Como ensalada.' },
      { id: 'k2', jp: 'すしとステーキがすきです。', reading: 'sushi to suteeki ga suki desu.', translation: 'Me gustan el sushi y el bistec.' },
      { id: 'k3', jp: 'セーターをきます。', reading: 'seetaa wo kimasu.', translation: 'Me pongo el suéter.' },
      { id: 'k4', jp: 'スープがあついです。', reading: 'suupu ga atsui desu.', translation: 'La sopa está caliente.' },
      { id: 'k5', jp: 'サッカーがすきです。', reading: 'sakkaa ga suki desu.', translation: 'Me gusta el fútbol.' },
      { id: 'k6', jp: 'ソファーでねます。', reading: 'sofaa de nemasu.', translation: 'Duermo en el sofá.' },
      { id: 'k7', jp: 'スカートをかいました。', reading: 'sukaato wo kaimashita.', translation: 'Compré una falda.' },
      { id: 'k8', jp: 'これはサイズがおおきいです。', reading: 'kore wa saizu ga ookii desu.', translation: 'Esto es de talla grande.' },
      { id: 'k9', jp: 'せんせいはアメリカじんです。', reading: 'sensei wa amerika jin desu.', translation: 'El profesor es estadounidense.' },
      { id: 'k10', jp: 'スイッチをおしてください。', reading: 'suicchi wo oshite kudasai.', translation: 'Presione el interruptor, por favor.' },
      { id: 'k11', jp: 'ソースをかけます。', reading: 'soosu wo kakemasu.', translation: 'Le pongo salsa.' },
      { id: 'k12', jp: 'すみません、シャワーはどこですか。', reading: 'sumimasen, shawaa wa doko desu ka.', translation: 'Disculpe, ¿dónde está la ducha?' },
    ],
  },
];

export function getKanaRowPractice(id: string): KanaRowPractice | undefined {
  return KANA_ROW_PRACTICE.find((r) => r.id === id);
}
