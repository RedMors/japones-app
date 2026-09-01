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
import type { Localized } from '@/lib/i18n/localized';

const PARTICLE_ANSWERS = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'から', 'まで', 'の', 'や'];

type RawItem = { sentence: string; answer: string; translation: Localized };

function toItem(raw: RawItem, index: number, group: string, idPrefix: string): CurriculumItem {
  return {
    id: `grammar:${idPrefix}:${index}`,
    prompt: raw.sentence.replace('___', '＿＿＿'),
    answer: raw.answer,
    group,
    subtext: raw.translation,
  };
}

const PARTICLES_N5: RawItem[] = [
  { sentence: '私[わたし]___学生[がくせい]です。', answer: 'は', translation: { es: 'Yo soy estudiante.', en: 'I am a student.' } },
  { sentence: 'これ___本[ほん]です。', answer: 'は', translation: { es: 'Esto es un libro.', en: 'This is a book.' } },
  { sentence: '今日[きょう]___暑[あつ]いです。', answer: 'は', translation: { es: 'Hoy hace calor.', en: "It's hot today." } },

  { sentence: '猫[ねこ]___います。', answer: 'が', translation: { es: 'Hay un gato.', en: 'There is a cat.' } },
  { sentence: '誰[だれ]___来[き]ましたか。', answer: 'が', translation: { es: '¿Quién vino?', en: 'Who came?' } },
  { sentence: '頭[あたま]___痛[いた]いです。', answer: 'が', translation: { es: 'Me duele la cabeza.', en: 'My head hurts.' } },

  { sentence: 'ご飯[はん]___食[た]べます。', answer: 'を', translation: { es: 'Como arroz.', en: 'I eat rice.' } },
  { sentence: '本[ほん]___読[よ]みます。', answer: 'を', translation: { es: 'Leo un libro.', en: 'I read a book.' } },
  { sentence: '音楽[おんがく]___聞[き]きます。', answer: 'を', translation: { es: 'Escucho música.', en: 'I listen to music.' } },

  { sentence: '七時[しちじ]___起[お]きます。', answer: 'に', translation: { es: 'Me levanto a las siete.', en: 'I get up at seven.' } },
  { sentence: '学校[がっこう]___行[い]きます。', answer: 'に', translation: { es: 'Voy a la escuela.', en: 'I go to school.' } },
  {
    sentence: '机[つくえ]の上[うえ]___本[ほん]があります。',
    answer: 'に',
    translation: { es: 'Hay un libro sobre el escritorio.', en: 'There is a book on the desk.' },
  },

  {
    sentence: '図書館[としょかん]___勉強[べんきょう]します。',
    answer: 'で',
    translation: { es: 'Estudio en la biblioteca.', en: 'I study at the library.' },
  },
  { sentence: 'バス___行[い]きます。', answer: 'で', translation: { es: 'Voy en autobús.', en: 'I go by bus.' } },
  { sentence: 'ペン___書[か]きます。', answer: 'で', translation: { es: 'Escribo con un lapicera.', en: 'I write with a pen.' } },

  {
    sentence: '友達[ともだち]___映画[えいが]を見[み]ます。',
    answer: 'と',
    translation: { es: 'Veo una película con un amigo.', en: 'I watch a movie with a friend.' },
  },
  {
    sentence: 'パン___牛乳[ぎゅうにゅう]を買[か]いました。',
    answer: 'と',
    translation: { es: 'Compré pan y leche.', en: 'I bought bread and milk.' },
  },

  { sentence: '兄[あに]___学生[がくせい]です。', answer: 'も', translation: { es: 'Mi hermano también es estudiante.', en: 'My brother is also a student.' } },
  { sentence: 'これ___好[す]きです。', answer: 'も', translation: { es: 'Esto también me gusta.', en: 'I like this too.' } },

  { sentence: '九時[くじ]___始[はじ]まります。', answer: 'から', translation: { es: 'Empieza desde las nueve.', en: 'It starts at nine.' } },
  { sentence: '日本[にほん]___来[き]ました。', answer: 'から', translation: { es: 'Vine desde Japón.', en: 'I came from Japan.' } },

  { sentence: '五時[ごじ]___働[はたら]きます。', answer: 'まで', translation: { es: 'Trabajo hasta las cinco.', en: 'I work until five.' } },
  { sentence: '駅[えき]___歩[ある]きます。', answer: 'まで', translation: { es: 'Camino hasta la estación.', en: 'I walk to the station.' } },

  { sentence: 'これは私[わたし]___本[ほん]です。', answer: 'の', translation: { es: 'Este es mi libro.', en: 'This is my book.' } },
  { sentence: '日本語[にほんご]___先生[せんせい]です。', answer: 'の', translation: { es: 'Es profesor de japonés.', en: 'He/She is a Japanese teacher.' } },

  {
    sentence: '机[つくえ]の上[うえ]に本[ほん]___ノートがあります。',
    answer: 'や',
    translation: {
      es: 'Sobre el escritorio hay cosas como libros y cuadernos.',
      en: 'On the desk there are things like books and notebooks.',
    },
  },
];

// idPrefix se mantiene "particles" tal cual estaba (no "grammar-n5-particulas")
// a propósito: cambiarlo invalidaría el progreso ya guardado de usuarios reales.
const particleItems = PARTICLES_N5.map((raw, i) => toItem(raw, i, 'grammar-n5-particulas', 'particles'));

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
  meaning: Localized;
  translation: Localized;
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
    meaning: { es: 'esperar', en: 'to wait' },
    translation: {
      es: 'Esperá un poco, por favor. (forma ~て + ください)',
      en: 'Wait a moment, please. (~te form + kudasai)',
    },
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
    meaning: { es: 'ver', en: 'to watch/see' },
    translation: {
      es: 'Ahora mismo estoy viendo tele. (~ている, progresivo)',
      en: "I'm watching TV right now. (~teiru, progressive)",
    },
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
    meaning: { es: 'ver', en: 'to watch/see' },
    translation: {
      es: 'Ayer vi una película. (pasado simple, informal)',
      en: 'I watched a movie yesterday. (simple past, informal)',
    },
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
    meaning: { es: 'comer', en: 'to eat' },
    translation: {
      es: 'No como carne. (negativo simple, informal)',
      en: "I don't eat meat. (simple negative, informal)",
    },
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
    meaning: { es: 'beber', en: 'to drink' },
    translation: {
      es: 'Tomo café todas las mañanas. (presente educado)',
      en: 'I drink coffee every morning. (polite present)',
    },
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
    meaning: { es: 'ir', en: 'to go' },
    translation: {
      es: 'La semana pasada fui a Kioto. (pasado educado)',
      en: 'Last week I went to Kyoto. (polite past)',
    },
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
    meaning: { es: 'sacar (una foto)', en: 'to take (a photo)' },
    translation: {
      es: '¿Puedo sacar una foto acá? (~てもいいですか, permiso)',
      en: 'Can I take a photo here? (~te mo ii desu ka, permission)',
    },
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
    meaning: { es: 'nadar', en: 'to swim' },
    translation: {
      es: 'Está prohibido nadar acá. (~てはいけません)',
      en: 'Swimming is not allowed here. (~te wa ikemasen)',
    },
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
    meaning: { es: 'sacar (una foto)', en: 'to take (a photo)' },
    translation: {
      es: 'Por favor no saques fotos. (~ないでください)',
      en: "Please don't take photos. (~nai de kudasai)",
    },
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
    meaning: { es: 'ir', en: 'to go' },
    translation: {
      es: 'Tengo la experiencia de haber ido a Japón. (~たことがある)',
      en: 'I have the experience of having been to Japan. (~ta koto ga aru)',
    },
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
    meaning: { es: 'jugar / divertirse', en: 'to play / have fun' },
    translation: {
      es: 'Los fines de semana hago cosas como jugar y leer. (~たり~たりする)',
      en: 'On weekends I do things like play and read. (~tari ~tari suru)',
    },
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
    meaning: { es: 'comer', en: 'to eat' },
    translation: {
      es: 'Comamos juntos. (volitivo informal, "vamos a...")',
      en: 'Let\'s eat together. (informal volitional, "let\'s...")',
    },
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
    meaning: { es: 'haber/tener (cosas)', en: 'to have/exist (things)' },
    translation: {
      es: 'Si tengo tiempo, ayudo. (condicional ~ば)',
      en: "If I have time, I'll help. (~ba conditional)",
    },
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
    meaning: { es: 'llover/caer (lluvia, nieve)', en: 'to fall (rain, snow)' },
    translation: {
      es: 'Si llueve, no voy. (condicional ~たら)',
      en: "If it rains, I won't go. (~tara conditional)",
    },
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
    meaning: { es: 'leer', en: 'to read' },
    translation: {
      es: 'Puedo leer este kanji. (forma potencial)',
      en: 'I can read this kanji. (potential form)',
    },
  },
];

const conjugationItems: CurriculumItem[] = VERB_CONJUGATION_N4.map((raw, i) => ({
  id: `grammar:n4-conjugation:${i}`,
  prompt: raw.sentence.replace('___', '＿＿＿'),
  answer: raw.answer,
  group: 'grammar-n4-conjugacion',
  choices: raw.choices.map(([form]) => form),
  choiceReadings: Object.fromEntries(raw.choices),
  subtext: {
    es: `${raw.dictForm} (${raw.meaning.es}) — ${raw.translation.es}`,
    en: `${raw.dictForm} (${raw.meaning.en}) — ${raw.translation.en}`,
  },
}));

/**
 * Gramática N3: 10 patrones de los que aparece en cualquier libro de N3
 * (Shin Kanzen Master N3, Tobira) — no de una lista pública (no se encontró
 * ninguna confiable, ver commit), sino escritos a mano con el mismo cuidado
 * que N5, cada oración revisada. Deliberadamente chico: mejor 10 bien hechos
 * que apurar los ~40-50 que tendría un N3 completo.
 */
const GRAMMAR_N3: RawItem[] = [
  // 〜そうだ (様態: se ve que..., por apariencia)
  { sentence: '雨[あめ]が降[ふ]り___です。', answer: 'そう', translation: { es: 'Parece que va a llover.', en: "It looks like it's going to rain." } },
  { sentence: 'このケーキ、おいし___です。', answer: 'そう', translation: { es: 'Esta torta se ve rica.', en: 'This cake looks delicious.' } },

  // 〜ようだ (parece que..., por inferencia/observación propia)
  { sentence: '誰[だれ]もいない___です。', answer: 'よう', translation: { es: 'Parece que no hay nadie.', en: 'It seems no one is there.' } },
  { sentence: '彼[かれ]は忙[いそが]しい___です。', answer: 'よう', translation: { es: 'Parece que él está ocupado.', en: 'It seems he is busy.' } },

  // 〜らしい (parece que..., por lo que se oyó/dijeron — no observación propia)
  { sentence: '明日[あした]は雨[あめ]___です。', answer: 'らしい', translation: { es: 'Dicen que mañana llueve.', en: "I heard it's going to rain tomorrow." } },
  {
    sentence: '彼[かれ]は元[もと]先生[せんせい]___です。',
    answer: 'らしい',
    translation: { es: 'Parece que él fue profesor (por lo que se dice).', en: 'I heard he used to be a teacher.' },
  },

  // 〜のに (a pesar de que..., contra lo esperado)
  {
    sentence: '頑張[がんば]った___、失敗[しっぱい]しました。',
    answer: 'のに',
    translation: { es: 'A pesar de que me esforcé, fracasé.', en: 'Even though I tried hard, I failed.' },
  },
  { sentence: '若[わか]い___、もう疲[つか]れています。', answer: 'のに', translation: { es: 'A pesar de ser joven, ya está cansado.', en: "Even though he's young, he's already tired." } },

  // 〜ため(に) (por causa de / debido a)
  {
    sentence: '台風[たいふう]の___、電車[でんしゃ]が止[と]まりました。',
    answer: 'ため',
    translation: { es: 'Los trenes se pararon debido al tifón.', en: 'The trains stopped because of the typhoon.' },
  },
  {
    sentence: '病気[びょうき]の___、学校[がっこう]を休[やす]みました。',
    answer: 'ため',
    translation: { es: 'Falté a la escuela debido a una enfermedad.', en: 'I missed school due to illness.' },
  },

  // 〜たばかり (recién..., acabo de...)
  { sentence: 'さっき起[お]きた___です。', answer: 'ばかり', translation: { es: 'Recién me desperté hace un momento.', en: 'I just woke up a moment ago.' } },
  {
    sentence: 'この店[みせ]は先月[せんげつ]できた___です。',
    answer: 'ばかり',
    translation: { es: 'Esta tienda recién abrió el mes pasado.', en: 'This shop just opened last month.' },
  },

  // 〜ように (para que..., de manera que...)
  {
    sentence: '忘[わす]れない___、メモしました。',
    answer: 'ように',
    translation: { es: 'Anoté una nota para no olvidarme.', en: "I wrote a note so I wouldn't forget." },
  },
  {
    sentence: 'みんなに聞[き]こえる___、大[おお]きな声[こえ]で話[はな]しました。',
    answer: 'ように',
    translation: { es: 'Hablé fuerte para que todos pudieran oír.', en: 'I spoke loudly so everyone could hear.' },
  },

  // 〜という (llamado..., que dice/se llama...)
  { sentence: '田中[たなか]___人[ひと]を知[し]っていますか。', answer: 'という', translation: { es: '¿Conocés a una persona llamada Tanaka?', en: 'Do you know a person called Tanaka?' } },
  {
    sentence: '「もったいない」___言葉[ことば]を知[し]っていますか。',
    answer: 'という',
    translation: { es: '¿Conocés la palabra "mottainai"?', en: 'Do you know the word "mottainai"?' },
  },

  // 〜において (en, dentro de — formal, ámbito/lugar/momento)
  {
    sentence: 'この分野[ぶんや]___、彼[かれ]が一番[いちばん]詳[くわ]しいです。',
    answer: 'において',
    translation: { es: 'En este campo, él es quien más sabe.', en: 'In this field, he knows the most.' },
  },
  {
    sentence: '現代[げんだい]社会[しゃかい]___、情報[じょうほう]はとても重要[じゅうよう]です。',
    answer: 'において',
    translation: { es: 'En la sociedad actual, la información es muy importante.', en: 'In modern society, information is very important.' },
  },

  // 〜によって (por, debido a / según — medio, causa o variación)
  {
    sentence: 'この橋[はし]は台風[たいふう]___壊[こわ]れました。',
    answer: 'によって',
    translation: { es: 'Este puente se destruyó por el tifón.', en: 'This bridge was destroyed by the typhoon.' },
  },
  {
    sentence: '人[ひと]___考[かんが]え方[かた]が違[ちが]います。',
    answer: 'によって',
    translation: { es: 'La forma de pensar varía según la persona.', en: 'The way of thinking varies by person.' },
  },
];

const grammarN3Items = GRAMMAR_N3.map((raw, i) =>
  toItem(raw, i, 'grammar-n3-patrones', 'n3-patrones'),
);

/** Gramática N2: mismo criterio que N3 — 10 patrones estándar (Shin Kanzen
 *  Master N2, Sou Matome N2), no obscuros, cada oración revisada a mano. */
const GRAMMAR_N2: RawItem[] = [
  // 〜わけではない (no es que..., negación parcial)
  { sentence: '嫌[きら]いな___、ただ時間[じかん]がないだけです。', answer: 'わけではない', translation: { es: 'No es que no me guste, solo que no tengo tiempo.', en: "It's not that I dislike it, I just don't have time." } },
  { sentence: '全部[ぜんぶ]分[わ]かった___、まだ質問[しつもん]があります。', answer: 'わけではない', translation: { es: 'No es que haya entendido todo, todavía tengo preguntas.', en: "It's not that I understood everything, I still have questions." } },

  // 〜にもかかわらず (a pesar de, pese a)
  { sentence: '雨[あめ]___、試合[しあい]は行[おこな]われました。', answer: 'にもかかわらず', translation: { es: 'A pesar de la lluvia, el partido se jugó.', en: 'Despite the rain, the match was played.' } },
  { sentence: '忙[いそが]しい___、彼[かれ]は手伝[てつだ]ってくれました。', answer: 'にもかかわらず', translation: { es: 'A pesar de estar ocupado, él me ayudó.', en: 'Despite being busy, he helped me.' } },

  // 〜をきっかけに (a partir de, tomando como motivo)
  { sentence: '病気[びょうき]___、生活[せいかつ]を見直[みなお]しました。', answer: 'をきっかけに', translation: { es: 'A raíz de mi enfermedad, reconsideré mi estilo de vida.', en: 'Triggered by my illness, I reconsidered my lifestyle.' } },
  { sentence: '友達[ともだち]の紹介[しょうかい]___、日本語[にほんご]を習[なら]い始[はじ]めました。', answer: 'をきっかけに', translation: { es: 'Motivado por la recomendación de un amigo, empecé a estudiar japonés.', en: "Prompted by a friend's recommendation, I started studying Japanese." } },

  // 〜ものの (aunque, si bien — más formal que けど)
  { sentence: '挑戦[ちょうせん]した___、失敗[しっぱい]しました。', answer: 'ものの', translation: { es: 'Aunque lo intenté, fracasé.', en: 'Although I tried, I failed.' } },
  { sentence: '約束[やくそく]した___、彼[かれ]は来[こ]なかった。', answer: 'ものの', translation: { es: 'Aunque prometió venir, él no vino.', en: "Although he promised to come, he didn't." } },

  // 〜にすぎない (no es más que, simplemente es)
  { sentence: 'それはただの噂[うわさ]___。', answer: 'にすぎない', translation: { es: 'Eso no es más que un rumor.', en: "That's nothing more than a rumor." } },
  { sentence: '彼[かれ]はまだ子供[こども]___。', answer: 'にすぎない', translation: { es: 'Él no es más que un niño todavía.', en: "He's still nothing more than a child." } },

  // 〜次第で (según, dependiendo de)
  { sentence: '結果[けっか]は努力[どりょく]___変[か]わります。', answer: '次第で', translation: { es: 'El resultado cambia según el esfuerzo.', en: 'The result changes depending on the effort.' } },
  { sentence: '天気[てんき]___予定[よてい]を変[か]えます。', answer: '次第で', translation: { es: 'Cambio los planes según el clima.', en: 'I change my plans depending on the weather.' } },

  // 〜つつ (mientras, a la vez que)
  { sentence: '音楽[おんがく]を聞[き]き___勉強[べんきょう]します。', answer: 'つつ', translation: { es: 'Estudio mientras escucho música.', en: 'I study while listening to music.' } },
  { sentence: '悪[わる]いと思[おも]い___、また遅刻[ちこく]してしまいました。', answer: 'つつ', translation: { es: 'Aun pensando que estaba mal, llegué tarde otra vez.', en: 'Even though I thought it was wrong, I was late again.' } },

  // 〜はもちろん (sin mencionar, por supuesto que también)
  { sentence: '英語[えいご]___、フランス語[ふらんすご]も話[はな]せます。', answer: 'はもちろん', translation: { es: 'Además del inglés, también habla francés.', en: 'Not to mention English, he also speaks French.' } },
  { sentence: '平日[へいじつ]___、週末[しゅうまつ]も働[はたら]いています。', answer: 'はもちろん', translation: { es: 'Además de entre semana, también trabajo los fines de semana.', en: 'Not to mention weekdays, I also work on weekends.' } },

  // 〜かねない (podría llegar a, hay riesgo de que)
  { sentence: 'そんなことをしたら、事故[じこ]になり___。', answer: 'かねない', translation: { es: 'Si hacés eso, podría terminar en un accidente.', en: 'If you do that, it could end up in an accident.' } },
  { sentence: '無理[むり]をすると、体[からだ]を壊[こわ]し___。', answer: 'かねない', translation: { es: 'Si te esforzás demasiado, podrías arruinar tu salud.', en: 'If you push yourself too hard, you could ruin your health.' } },

  // 〜とはいえ (dicho esto, aun así)
  { sentence: '便利[べんり]___、使[つか]い方[かた]が難[むずか]しいです。', answer: 'とはいえ', translation: { es: 'Aunque es conveniente, el modo de uso es difícil.', en: "Although it's convenient, it's hard to use." } },
  { sentence: '子供[こども]___、もう十分[じゅうぶん]な知識[ちしき]があります。', answer: 'とはいえ', translation: { es: 'Aunque es un niño, ya tiene suficiente conocimiento.', en: "Although he's a child, he already has enough knowledge." } },
];

const grammarN2Items = GRAMMAR_N2.map((raw, i) =>
  toItem(raw, i, 'grammar-n2-patrones', 'n2-patrones'),
);

/** Gramática N1: mismo criterio, 10 patrones estándar de cualquier curso N1
 *  (Shin Kanzen Master N1, Sou Matome N1) — se evitó a propósito lo más
 *  literario/raro (まじき, てやまない) por menor confianza en la nuance. */
const GRAMMAR_N1: RawItem[] = [
  // 〜ざるを得ない (no tener más remedio que, verbo nai-stem + ざるを得ない)
  { sentence: '忙[いそが]しくても、行[い]か___。', answer: 'ざるを得ない', translation: { es: 'Aunque esté ocupado, no tengo más remedio que ir.', en: "Even if I'm busy, I have no choice but to go." } },
  { sentence: '台風[たいふう]のため、旅行[りょこう]を中止[ちゅうし]せ___。', answer: 'ざるを得ない', translation: { es: 'Por el tifón, no hay más remedio que cancelar el viaje.', en: "Because of the typhoon, there's no choice but to cancel the trip." } },

  // 〜を余儀なくされる (verse forzado a, sin poder evitarlo)
  { sentence: '資金[しきん]不足[ぶそく]で、計画[けいかく]の変更[へんこう]___。', answer: 'を余儀なくされた', translation: { es: 'Por falta de fondos, se vio forzado el cambio de plan.', en: 'Due to lack of funds, the plan change was forced.' } },
  { sentence: '事故[じこ]のため、電車[でんしゃ]は運休[うんきゅう]___。', answer: 'を余儀なくされた', translation: { es: 'Por el accidente, el tren se vio forzado a suspender el servicio.', en: 'Because of the accident, the train was forced to suspend service.' } },

  // 〜にたえない (insoportable, no poder soportar — verbo diccionario + にたえない)
  { sentence: 'あまりにひどくて、見[み]る___光景[こうけい]だった。', answer: 'にたえない', translation: { es: 'Era una escena tan terrible que no se podía soportar mirarla.', en: 'It was such a terrible scene that it was unbearable to watch.' } },
  { sentence: '彼[かれ]の態度[たいど]は聞[き]く___ものだった。', answer: 'にたえない', translation: { es: 'Su actitud era insoportable de escuchar.', en: 'His attitude was unbearable to listen to.' } },

  // 〜極まりない (extremadamente — adjetivo-な + 極まりない)
  { sentence: 'この計画[けいかく]は無謀[むぼう]___。', answer: '極まりない', translation: { es: 'Este plan es extremadamente imprudente.', en: 'This plan is extremely reckless.' } },
  { sentence: '彼[かれ]の態度[たいど]は失礼[しつれい]___。', answer: '極まりない', translation: { es: 'Su actitud es extremadamente maleducada.', en: 'His attitude is extremely rude.' } },

  // 〜ならでは (propio de, único de — solo posible gracias a)
  { sentence: 'これはこの店[みせ]___の味[あじ]です。', answer: 'ならでは', translation: { es: 'Este es un sabor único de esta tienda.', en: 'This is a flavor unique to this shop.' } },
  { sentence: '京都[きょうと]___の景色[けしき]を楽[たの]しみました。', answer: 'ならでは', translation: { es: 'Disfruté de un paisaje único de Kioto.', en: 'I enjoyed scenery unique to Kyoto.' } },

  // 〜んばかり (como si estuviera a punto de — verbo a-stem + んばかり; antes
  // de un sustantivo va んばかりの, no んばかりに — corregido: además tenía
  // 泣き (masu-stem) en vez de 泣か (a-stem, la que pide んばかり).
  { sentence: '今[いま]にも泣[な]か___の顔[かお]をしていた。', answer: 'んばかり', translation: { es: 'Tenía una cara como si estuviera a punto de llorar.', en: 'He had a face as if he were about to cry.' } },
  { sentence: '彼[かれ]は「行[い]け」と言[い]わ___の勢[いきお]いで私[わたし]を見[み]た。', answer: 'んばかり', translation: { es: 'Me miró con una fuerza como si dijera "andá".', en: 'He looked at me as if saying "go".' } },

  // 〜にひきかえ (en contraste con)
  { sentence: '兄[あに]の真面目[まじめ]さ___、弟[おとうと]は遊[あそ]んでばかりいる。', answer: 'にひきかえ', translation: { es: 'En contraste con la seriedad del hermano mayor, el menor solo juega.', en: "In contrast to the older brother's seriousness, the younger one only plays." } },
  { sentence: '去年[きょねん]___、今年[ことし]は雪[ゆき]が少[すく]ない。', answer: 'にひきかえ', translation: { es: 'En contraste con el año pasado, este año hay poca nieve.', en: "In contrast to last year, there's little snow this year." } },

  // 〜ものを (si tan solo..., pero — reproche/arrepentimiento)
  { sentence: 'すぐ謝[あやま]れば良[よ]かった___、意地[いじ]を張[は]ってしまった。', answer: 'ものを', translation: { es: 'Si tan solo hubiera pedido perdón enseguida, pero me puse terco.', en: 'If only I had apologized right away, but I got stubborn.' } },
  { sentence: '教[おし]えてくれれば良[よ]かった___、黙[だま]っていた。', answer: 'ものを', translation: { es: 'Si tan solo me hubiera avisado, pero se quedó callado.', en: 'If only he had told me, but he stayed silent.' } },

  // 〜にもまして (todavía más que, aún más que)
  { sentence: '今年[ことし]は去年[きょねん]___暑[あつ]い。', answer: 'にもまして', translation: { es: 'Este año hace todavía más calor que el año pasado.', en: 'This year it is even hotter than last year.' } },
  { sentence: '彼女[かのじょ]は以前[いぜん]___美[うつく]しくなった。', answer: 'にもまして', translation: { es: 'Ella se puso todavía más linda que antes.', en: 'She became even more beautiful than before.' } },

  // 〜すら (hasta, incluso — más formal que さえ)
  { sentence: '子供[こども]___知[し]っている常識[じょうしき]だ。', answer: 'すら', translation: { es: 'Es de conocimiento común, hasta los niños lo saben.', en: 'It is common knowledge, even children know it.' } },
  { sentence: '彼[かれ]は自分[じぶん]の名前[なまえ]___忘[わす]れてしまった。', answer: 'すら', translation: { es: 'Se olvidó hasta de su propio nombre.', en: 'He even forgot his own name.' } },
];

const grammarN1Items = GRAMMAR_N1.map((raw, i) =>
  toItem(raw, i, 'grammar-n1-patrones', 'n1-patrones'),
);

export const GRAMMAR_UNITS: Omit<Unit, 'order'>[] = [
  {
    id: 'grammar-n5-particulas',
    title: { es: 'N5 — Partículas básicas', en: 'N5 — Basic particles' },
    level: 'N5',
    items: particleItems,
  },
  {
    id: 'grammar-n4-conjugacion',
    title: { es: 'N4 — Conjugación verbal básica', en: 'N4 — Basic verb conjugation' },
    level: 'N4',
    items: conjugationItems,
  },
  {
    id: 'grammar-n3-patrones',
    title: { es: 'N3 — Patrones gramaticales', en: 'N3 — Grammar patterns' },
    level: 'N3',
    items: grammarN3Items,
  },
  {
    id: 'grammar-n2-patrones',
    title: { es: 'N2 — Patrones gramaticales', en: 'N2 — Grammar patterns' },
    level: 'N2',
    items: grammarN2Items,
  },
  {
    id: 'grammar-n1-patrones',
    title: { es: 'N1 — Patrones gramaticales', en: 'N1 — Grammar patterns' },
    level: 'N1',
    items: grammarN1Items,
  },
];

// Reexportado por si el front necesita listar las partículas cubiertas.
export const N5_PARTICLES = PARTICLE_ANSWERS;
