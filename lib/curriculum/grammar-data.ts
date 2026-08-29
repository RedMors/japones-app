/**
 * Gramática como "completar el espacio en blanco": mismo formato de opción
 * múltiple que vocabulario y kana, sin componente de UI nuevo. `subtext` es
 * siempre la traducción — no es la respuesta, así que no arruina el ejercicio.
 *
 * Contenido curado a mano (no generado de una lista pública): partículas
 * básicas de N5, el punto de gramática más fundamental y el que más
 * confunde a un principiante. El resto de la gramática de N5-N1 queda como
 * trabajo futuro — preferible tener esto bien hecho que apurar contenido
 * de dudosa precisión.
 */
import type { CurriculumItem, Unit } from './units.ts';

const PARTICLE_ANSWERS = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'から', 'まで', 'の', 'や'];

type RawItem = { sentence: string; answer: string; translation: string };

function toItem(raw: RawItem, index: number, group: string): CurriculumItem {
  return {
    id: `grammar:particles:${index}`,
    prompt: raw.sentence.replace('___', '＿＿＿'),
    answer: raw.answer,
    group,
    subtext: raw.translation,
  };
}

const PARTICLES_N5: RawItem[] = [
  { sentence: '私[わたし]___学生[がくせい]です。', answer: 'は', translation: 'Yo soy estudiante.' },
  { sentence: 'これ___本[ほん]です。', answer: 'は', translation: 'Esto es un libro.' },
  { sentence: '今日[きょう]___暑[あつ]いです。', answer: 'は', translation: 'Hoy hace calor.' },

  { sentence: '猫[ねこ]___います。', answer: 'が', translation: 'Hay un gato.' },
  { sentence: '誰[だれ]___来[き]ましたか。', answer: 'が', translation: '¿Quién vino?' },
  { sentence: '頭[あたま]___痛[いた]いです。', answer: 'が', translation: 'Me duele la cabeza.' },

  { sentence: 'ご飯[はん]___食[た]べます。', answer: 'を', translation: 'Como arroz.' },
  { sentence: '本[ほん]___読[よ]みます。', answer: 'を', translation: 'Leo un libro.' },
  { sentence: '音楽[おんがく]___聞[き]きます。', answer: 'を', translation: 'Escucho música.' },

  { sentence: '七時[しちじ]___起[お]きます。', answer: 'に', translation: 'Me levanto a las siete.' },
  { sentence: '学校[がっこう]___行[い]きます。', answer: 'に', translation: 'Voy a la escuela.' },
  {
    sentence: '机[つくえ]の上[うえ]___本[ほん]があります。',
    answer: 'に',
    translation: 'Hay un libro sobre el escritorio.',
  },

  {
    sentence: '図書館[としょかん]___勉強[べんきょう]します。',
    answer: 'で',
    translation: 'Estudio en la biblioteca.',
  },
  { sentence: 'バス___行[い]きます。', answer: 'で', translation: 'Voy en autobús.' },
  { sentence: 'ペン___書[か]きます。', answer: 'で', translation: 'Escribo con un lapicera.' },

  {
    sentence: '友達[ともだち]___映画[えいが]を見[み]ます。',
    answer: 'と',
    translation: 'Veo una película con un amigo.',
  },
  {
    sentence: 'パン___牛乳[ぎゅうにゅう]を買[か]いました。',
    answer: 'と',
    translation: 'Compré pan y leche.',
  },

  { sentence: '兄[あに]___学生[がくせい]です。', answer: 'も', translation: 'Mi hermano también es estudiante.' },
  { sentence: 'これ___好[す]きです。', answer: 'も', translation: 'Esto también me gusta.' },

  { sentence: '九時[くじ]___始[はじ]まります。', answer: 'から', translation: 'Empieza desde las nueve.' },
  { sentence: '日本[にほん]___来[き]ました。', answer: 'から', translation: 'Vine desde Japón.' },

  { sentence: '五時[ごじ]___働[はたら]きます。', answer: 'まで', translation: 'Trabajo hasta las cinco.' },
  { sentence: '駅[えき]___歩[ある]きます。', answer: 'まで', translation: 'Camino hasta la estación.' },

  { sentence: 'これは私[わたし]___本[ほん]です。', answer: 'の', translation: 'Este es mi libro.' },
  { sentence: '日本語[にほんご]___先生[せんせい]です。', answer: 'の', translation: 'Es profesor de japonés.' },

  {
    sentence: '机[つくえ]の上[うえ]に本[ほん]___ノートがあります。',
    answer: 'や',
    translation: 'Sobre el escritorio hay cosas como libros y cuadernos.',
  },
];

const particleItems = PARTICLES_N5.map((raw, i) => toItem(raw, i, 'grammar-n5-particulas'));

/**
 * Conjugación verbal N4. A diferencia de partículas, acá el distractor
 * correcto son OTRAS FORMAS DEL MISMO VERBO (見た vs 見る vs 見て vs 見ない),
 * no una respuesta de otro ítem — por eso cada uno trae su propio `choices`
 * en vez de compartir un pool. Verbos elegidos por ser los que todo curso
 * N4 usa de ejemplo (Genki II / Minna no Nihongo II): 一段 (見る, 食べる),
 * 五段 en varias terminaciones (待つ, 飲む, 行く, 撮る, 泳ぐ, 遊ぶ, 読む,
 * 降る) y ある/する irregulares.
 */
type ConjugationItem = {
  sentence: string;
  answer: string;
  /** [forma, lectura] — sin lectura visible es imposible saber cómo suena
   *  una forma conjugada que todavía no aprendiste a leer de un vistazo. */
  choices: [string, string][];
  dictForm: string;
  meaning: string;
  translation: string;
};

const VERB_CONJUGATION_N4: ConjugationItem[] = [
  {
    sentence: 'ちょっと___ください。',
    answer: '待って',
    choices: [
      ['待って', 'まって'],
      ['待った', 'まった'],
      ['待ちます', 'まちます'],
      ['待たない', 'またない'],
    ],
    dictForm: '待つ',
    meaning: 'esperar',
    translation: 'Esperá un poco, por favor. (forma ~て + ください)',
  },
  {
    sentence: '今[いま]、テレビを___。',
    answer: '見ています',
    choices: [
      ['見ています', 'みています'],
      ['見ました', 'みました'],
      ['見ません', 'みません'],
      ['見て', 'みて'],
    ],
    dictForm: '見る',
    meaning: 'ver',
    translation: 'Ahora mismo estoy viendo tele. (~ている, progresivo)',
  },
  {
    sentence: '昨日[きのう]、映画[えいが]を___。',
    answer: '見た',
    choices: [
      ['見た', 'みた'],
      ['見る', 'みる'],
      ['見ない', 'みない'],
      ['見て', 'みて'],
    ],
    dictForm: '見る',
    meaning: 'ver',
    translation: 'Ayer vi una película. (pasado simple, informal)',
  },
  {
    sentence: '肉[にく]を___。',
    answer: '食べない',
    choices: [
      ['食べない', 'たべない'],
      ['食べる', 'たべる'],
      ['食べた', 'たべた'],
      ['食べて', 'たべて'],
    ],
    dictForm: '食べる',
    meaning: 'comer',
    translation: 'No como carne. (negativo simple, informal)',
  },
  {
    sentence: '毎朝[まいあさ]、コーヒーを___。',
    answer: '飲みます',
    choices: [
      ['飲みます', 'のみます'],
      ['飲んで', 'のんで'],
      ['飲んだ', 'のんだ'],
      ['飲まない', 'のまない'],
    ],
    dictForm: '飲む',
    meaning: 'beber',
    translation: 'Tomo café todas las mañanas. (presente educado)',
  },
  {
    sentence: '先週[せんしゅう]、京都[きょうと]へ___。',
    answer: '行きました',
    choices: [
      ['行きました', 'いきました'],
      ['行きます', 'いきます'],
      ['行って', 'いって'],
      ['行かない', 'いかない'],
    ],
    dictForm: '行く',
    meaning: 'ir',
    translation: 'La semana pasada fui a Kioto. (pasado educado)',
  },
  {
    sentence: 'ここで写真[しゃしん]を___もいいですか。',
    answer: '撮って',
    choices: [
      ['撮って', 'とって'],
      ['撮った', 'とった'],
      ['撮ります', 'とります'],
      ['撮らない', 'とらない'],
    ],
    dictForm: '撮る',
    meaning: 'sacar (una foto)',
    translation: '¿Puedo sacar una foto acá? (~てもいいですか, permiso)',
  },
  {
    sentence: 'ここで___はいけません。',
    answer: '泳いで',
    choices: [
      ['泳いで', 'およいで'],
      ['泳ぐ', 'およぐ'],
      ['泳いだ', 'およいだ'],
      ['泳がない', 'およがない'],
    ],
    dictForm: '泳ぐ',
    meaning: 'nadar',
    translation: 'Está prohibido nadar acá. (~てはいけません)',
  },
  {
    sentence: '写真[しゃしん]を___でください。',
    answer: '撮らない',
    choices: [
      ['撮らない', 'とらない'],
      ['撮って', 'とって'],
      ['撮った', 'とった'],
      ['撮ります', 'とります'],
    ],
    dictForm: '撮る',
    meaning: 'sacar (una foto)',
    translation: 'Por favor no saques fotos. (~ないでください)',
  },
  {
    sentence: '日本[にほん]に___ことがあります。',
    answer: '行った',
    choices: [
      ['行った', 'いった'],
      ['行く', 'いく'],
      ['行って', 'いって'],
      ['行かない', 'いかない'],
    ],
    dictForm: '行く',
    meaning: 'ir',
    translation: 'Tengo la experiencia de haber ido a Japón. (~たことがある)',
  },
  {
    sentence: '週末[しゅうまつ]は___、本[ほん]を読[よ]んだりします。',
    answer: '遊んだり',
    choices: [
      ['遊んだり', 'あそんだり'],
      ['遊ぶ', 'あそぶ'],
      ['遊んで', 'あそんで'],
      ['遊ばない', 'あそばない'],
    ],
    dictForm: '遊ぶ',
    meaning: 'jugar / divertirse',
    translation: 'Los fines de semana hago cosas como jugar y leer. (~たり~たりする)',
  },
  {
    sentence: '一緒[いっしょ]に___。',
    answer: '食べよう',
    choices: [
      ['食べよう', 'たべよう'],
      ['食べます', 'たべます'],
      ['食べて', 'たべて'],
      ['食べない', 'たべない'],
    ],
    dictForm: '食べる',
    meaning: 'comer',
    translation: 'Comamos juntos. (volitivo informal, "vamos a...")',
  },
  {
    sentence: '時間[じかん]が___、手伝[てつだ]います。',
    answer: 'あれば',
    choices: [
      ['あれば', 'あれば'],
      ['あった', 'あった'],
      ['ある', 'ある'],
      ['ない', 'ない'],
    ],
    dictForm: 'ある',
    meaning: 'haber/tener (cosas)',
    translation: 'Si tengo tiempo, ayudo. (condicional ~ば)',
  },
  {
    sentence: '雨[あめ]が___、行[い]きません。',
    answer: '降ったら',
    choices: [
      ['降ったら', 'ふったら'],
      ['降る', 'ふる'],
      ['降って', 'ふって'],
      ['降らない', 'ふらない'],
    ],
    dictForm: '降る',
    meaning: 'llover/caer (lluvia, nieve)',
    translation: 'Si llueve, no voy. (condicional ~たら)',
  },
  {
    sentence: 'この漢字[かんじ]が___。',
    answer: '読める',
    choices: [
      ['読める', 'よめる'],
      ['読む', 'よむ'],
      ['読んで', 'よんで'],
      ['読まない', 'よまない'],
    ],
    dictForm: '読む',
    meaning: 'leer',
    translation: 'Puedo leer este kanji. (forma potencial)',
  },
];

const conjugationItems: CurriculumItem[] = VERB_CONJUGATION_N4.map((raw, i) => ({
  id: `grammar:n4-conjugation:${i}`,
  prompt: raw.sentence.replace('___', '＿＿＿'),
  answer: raw.answer,
  group: 'grammar-n4-conjugacion',
  choices: raw.choices.map(([form]) => form),
  choiceReadings: Object.fromEntries(raw.choices),
  subtext: `${raw.dictForm} (${raw.meaning}) — ${raw.translation}`,
}));

export const GRAMMAR_UNITS: Omit<Unit, 'order'>[] = [
  {
    id: 'grammar-n5-particulas',
    title: 'N5 — Partículas básicas',
    level: 'N5',
    items: particleItems,
  },
  {
    id: 'grammar-n4-conjugacion',
    title: 'N4 — Conjugación verbal básica',
    level: 'N4',
    items: conjugationItems,
  },
];

// Reexportado por si el front necesita listar las partículas cubiertas.
export const N5_PARTICLES = PARTICLE_ANSWERS;
