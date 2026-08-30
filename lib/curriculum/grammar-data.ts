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

/**
 * Gramática N3: 10 patrones de los que aparece en cualquier libro de N3
 * (Shin Kanzen Master N3, Tobira) — no de una lista pública (no se encontró
 * ninguna confiable, ver commit), sino escritos a mano con el mismo cuidado
 * que N5, cada oración revisada. Deliberadamente chico: mejor 10 bien hechos
 * que apurar los ~40-50 que tendría un N3 completo.
 */
const GRAMMAR_N3: RawItem[] = [
  // 〜そうだ (様態: se ve que..., por apariencia)
  { sentence: '雨[あめ]が降[ふ]り___です。', answer: 'そう', translation: 'Parece que va a llover.' },
  { sentence: 'このケーキ、おいし___です。', answer: 'そう', translation: 'Esta torta se ve rica.' },

  // 〜ようだ (parece que..., por inferencia/observación propia)
  { sentence: '誰[だれ]もいない___です。', answer: 'よう', translation: 'Parece que no hay nadie.' },
  { sentence: '彼[かれ]は忙[いそが]しい___です。', answer: 'よう', translation: 'Parece que él está ocupado.' },

  // 〜らしい (parece que..., por lo que se oyó/dijeron — no observación propia)
  { sentence: '明日[あした]は雨[あめ]___です。', answer: 'らしい', translation: 'Dicen que mañana llueve.' },
  {
    sentence: '彼[かれ]は元[もと]先生[せんせい]___です。',
    answer: 'らしい',
    translation: 'Parece que él fue profesor (por lo que se dice).',
  },

  // 〜のに (a pesar de que..., contra lo esperado)
  {
    sentence: '頑張[がんば]った___、失敗[しっぱい]しました。',
    answer: 'のに',
    translation: 'A pesar de que me esforcé, fracasé.',
  },
  { sentence: '若[わか]い___、もう疲[つか]れています。', answer: 'のに', translation: 'A pesar de ser joven, ya está cansado.' },

  // 〜ため(に) (por causa de / debido a)
  {
    sentence: '台風[たいふう]の___、電車[でんしゃ]が止[と]まりました。',
    answer: 'ため',
    translation: 'Los trenes se pararon debido al tifón.',
  },
  {
    sentence: '病気[びょうき]の___、学校[がっこう]を休[やす]みました。',
    answer: 'ため',
    translation: 'Falté a la escuela debido a una enfermedad.',
  },

  // 〜たばかり (recién..., acabo de...)
  { sentence: 'さっき起[お]きた___です。', answer: 'ばかり', translation: 'Recién me desperté hace un momento.' },
  {
    sentence: 'この店[みせ]は先月[せんげつ]できた___です。',
    answer: 'ばかり',
    translation: 'Esta tienda recién abrió el mes pasado.',
  },

  // 〜ように (para que..., de manera que...)
  {
    sentence: '忘[わす]れない___、メモしました。',
    answer: 'ように',
    translation: 'Anoté una nota para no olvidarme.',
  },
  {
    sentence: 'みんなに聞[き]こえる___、大[おお]きな声[こえ]で話[はな]しました。',
    answer: 'ように',
    translation: 'Hablé fuerte para que todos pudieran oír.',
  },

  // 〜という (llamado..., que dice/se llama...)
  { sentence: '田中[たなか]___人[ひと]を知[し]っていますか。', answer: 'という', translation: '¿Conocés a una persona llamada Tanaka?' },
  {
    sentence: '「もったいない」___言葉[ことば]を知[し]っていますか。',
    answer: 'という',
    translation: '¿Conocés la palabra "mottainai"?',
  },

  // 〜において (en, dentro de — formal, ámbito/lugar/momento)
  {
    sentence: 'この分野[ぶんや]___、彼[かれ]が一番[いちばん]詳[くわ]しいです。',
    answer: 'において',
    translation: 'En este campo, él es quien más sabe.',
  },
  {
    sentence: '現代[げんだい]社会[しゃかい]___、情報[じょうほう]はとても重要[じゅうよう]です。',
    answer: 'において',
    translation: 'En la sociedad actual, la información es muy importante.',
  },

  // 〜によって (por, debido a / según — medio, causa o variación)
  {
    sentence: 'この橋[はし]は台風[たいふう]___壊[こわ]れました。',
    answer: 'によって',
    translation: 'Este puente se destruyó por el tifón.',
  },
  {
    sentence: '人[ひと]___考[かんが]え方[かた]が違[ちが]います。',
    answer: 'によって',
    translation: 'La forma de pensar varía según la persona.',
  },
];

const grammarN3Items = GRAMMAR_N3.map((raw, i) =>
  toItem(raw, i, 'grammar-n3-patrones', 'n3-patrones'),
);

/** Gramática N2: mismo criterio que N3 — 10 patrones estándar (Shin Kanzen
 *  Master N2, Sou Matome N2), no obscuros, cada oración revisada a mano. */
const GRAMMAR_N2: RawItem[] = [
  // 〜わけではない (no es que..., negación parcial)
  { sentence: '嫌[きら]いな___、ただ時間[じかん]がないだけです。', answer: 'わけではない', translation: 'No es que no me guste, solo que no tengo tiempo.' },
  { sentence: '全部[ぜんぶ]分[わ]かった___、まだ質問[しつもん]があります。', answer: 'わけではない', translation: 'No es que haya entendido todo, todavía tengo preguntas.' },

  // 〜にもかかわらず (a pesar de, pese a)
  { sentence: '雨[あめ]___、試合[しあい]は行[おこな]われました。', answer: 'にもかかわらず', translation: 'A pesar de la lluvia, el partido se jugó.' },
  { sentence: '忙[いそが]しい___、彼[かれ]は手伝[てつだ]ってくれました。', answer: 'にもかかわらず', translation: 'A pesar de estar ocupado, él me ayudó.' },

  // 〜をきっかけに (a partir de, tomando como motivo)
  { sentence: '病気[びょうき]___、生活[せいかつ]を見直[みなお]しました。', answer: 'をきっかけに', translation: 'A raíz de mi enfermedad, reconsideré mi estilo de vida.' },
  { sentence: '友達[ともだち]の紹介[しょうかい]___、日本語[にほんご]を習[なら]い始[はじ]めました。', answer: 'をきっかけに', translation: 'Motivado por la recomendación de un amigo, empecé a estudiar japonés.' },

  // 〜ものの (aunque, si bien — más formal que けど)
  { sentence: '挑戦[ちょうせん]した___、失敗[しっぱい]しました。', answer: 'ものの', translation: 'Aunque lo intenté, fracasé.' },
  { sentence: '約束[やくそく]した___、彼[かれ]は来[こ]なかった。', answer: 'ものの', translation: 'Aunque prometió venir, él no vino.' },

  // 〜にすぎない (no es más que, simplemente es)
  { sentence: 'それはただの噂[うわさ]___。', answer: 'にすぎない', translation: 'Eso no es más que un rumor.' },
  { sentence: '彼[かれ]はまだ子供[こども]___。', answer: 'にすぎない', translation: 'Él no es más que un niño todavía.' },

  // 〜次第で (según, dependiendo de)
  { sentence: '結果[けっか]は努力[どりょく]___変[か]わります。', answer: '次第で', translation: 'El resultado cambia según el esfuerzo.' },
  { sentence: '天気[てんき]___予定[よてい]を変[か]えます。', answer: '次第で', translation: 'Cambio los planes según el clima.' },

  // 〜つつ (mientras, a la vez que)
  { sentence: '音楽[おんがく]を聞[き]き___勉強[べんきょう]します。', answer: 'つつ', translation: 'Estudio mientras escucho música.' },
  { sentence: '悪[わる]いと思[おも]い___、また遅刻[ちこく]してしまいました。', answer: 'つつ', translation: 'Aun pensando que estaba mal, llegué tarde otra vez.' },

  // 〜はもちろん (sin mencionar, por supuesto que también)
  { sentence: '英語[えいご]___、フランス語[ふらんすご]も話[はな]せます。', answer: 'はもちろん', translation: 'Además del inglés, también habla francés.' },
  { sentence: '平日[へいじつ]___、週末[しゅうまつ]も働[はたら]いています。', answer: 'はもちろん', translation: 'Además de entre semana, también trabajo los fines de semana.' },

  // 〜かねない (podría llegar a, hay riesgo de que)
  { sentence: 'そんなことをしたら、事故[じこ]になり___。', answer: 'かねない', translation: 'Si hacés eso, podría terminar en un accidente.' },
  { sentence: '無理[むり]をすると、体[からだ]を壊[こわ]し___。', answer: 'かねない', translation: 'Si te esforzás demasiado, podrías arruinar tu salud.' },

  // 〜とはいえ (dicho esto, aun así)
  { sentence: '便利[べんり]___、使[つか]い方[かた]が難[むずか]しいです。', answer: 'とはいえ', translation: 'Aunque es conveniente, el modo de uso es difícil.' },
  { sentence: '子供[こども]___、もう十分[じゅうぶん]な知識[ちしき]があります。', answer: 'とはいえ', translation: 'Aunque es un niño, ya tiene suficiente conocimiento.' },
];

const grammarN2Items = GRAMMAR_N2.map((raw, i) =>
  toItem(raw, i, 'grammar-n2-patrones', 'n2-patrones'),
);

/** Gramática N1: mismo criterio, 10 patrones estándar de cualquier curso N1
 *  (Shin Kanzen Master N1, Sou Matome N1) — se evitó a propósito lo más
 *  literario/raro (まじき, てやまない) por menor confianza en la nuance. */
const GRAMMAR_N1: RawItem[] = [
  // 〜ざるを得ない (no tener más remedio que, verbo nai-stem + ざるを得ない)
  { sentence: '忙[いそが]しくても、行[い]か___。', answer: 'ざるを得ない', translation: 'Aunque esté ocupado, no tengo más remedio que ir.' },
  { sentence: '台風[たいふう]のため、旅行[りょこう]を中止[ちゅうし]せ___。', answer: 'ざるを得ない', translation: 'Por el tifón, no hay más remedio que cancelar el viaje.' },

  // 〜を余儀なくされる (verse forzado a, sin poder evitarlo)
  { sentence: '資金[しきん]不足[ぶそく]で、計画[けいかく]の変更[へんこう]___。', answer: 'を余儀なくされた', translation: 'Por falta de fondos, se vio forzado el cambio de plan.' },
  { sentence: '事故[じこ]のため、電車[でんしゃ]は運休[うんきゅう]___。', answer: 'を余儀なくされた', translation: 'Por el accidente, el tren se vio forzado a suspender el servicio.' },

  // 〜にたえない (insoportable, no poder soportar — verbo diccionario + にたえない)
  { sentence: 'あまりにひどくて、見[み]る___光景[こうけい]だった。', answer: 'にたえない', translation: 'Era una escena tan terrible que no se podía soportar mirarla.' },
  { sentence: '彼[かれ]の態度[たいど]は聞[き]く___ものだった。', answer: 'にたえない', translation: 'Su actitud era insoportable de escuchar.' },

  // 〜極まりない (extremadamente — adjetivo-な + 極まりない)
  { sentence: 'この計画[けいかく]は無謀[むぼう]___。', answer: '極まりない', translation: 'Este plan es extremadamente imprudente.' },
  { sentence: '彼[かれ]の態度[たいど]は失礼[しつれい]___。', answer: '極まりない', translation: 'Su actitud es extremadamente maleducada.' },

  // 〜ならでは (propio de, único de — solo posible gracias a)
  { sentence: 'これはこの店[みせ]___の味[あじ]です。', answer: 'ならでは', translation: 'Este es un sabor único de esta tienda.' },
  { sentence: '京都[きょうと]___の景色[けしき]を楽[たの]しみました。', answer: 'ならでは', translation: 'Disfruté de un paisaje único de Kioto.' },

  // 〜んばかり (como si estuviera a punto de — verbo a-stem + んばかり; antes
  // de un sustantivo va んばかりの, no んばかりに — corregido: además tenía
  // 泣き (masu-stem) en vez de 泣か (a-stem, la que pide んばかり).
  { sentence: '今[いま]にも泣[な]か___の顔[かお]をしていた。', answer: 'んばかり', translation: 'Tenía una cara como si estuviera a punto de llorar.' },
  { sentence: '彼[かれ]は「行[い]け」と言[い]わ___の勢[いきお]いで私[わたし]を見[み]た。', answer: 'んばかり', translation: 'Me miró con una fuerza como si dijera "andá".' },

  // 〜にひきかえ (en contraste con)
  { sentence: '兄[あに]の真面目[まじめ]さ___、弟[おとうと]は遊[あそ]んでばかりいる。', answer: 'にひきかえ', translation: 'En contraste con la seriedad del hermano mayor, el menor solo juega.' },
  { sentence: '去年[きょねん]___、今年[ことし]は雪[ゆき]が少[すく]ない。', answer: 'にひきかえ', translation: 'En contraste con el año pasado, este año hay poca nieve.' },

  // 〜ものを (si tan solo..., pero — reproche/arrepentimiento)
  { sentence: 'すぐ謝[あやま]れば良[よ]かった___、意地[いじ]を張[は]ってしまった。', answer: 'ものを', translation: 'Si tan solo hubiera pedido perdón enseguida, pero me puse terco.' },
  { sentence: '教[おし]えてくれれば良[よ]かった___、黙[だま]っていた。', answer: 'ものを', translation: 'Si tan solo me hubiera avisado, pero se quedó callado.' },

  // 〜にもまして (todavía más que, aún más que)
  { sentence: '今年[ことし]は去年[きょねん]___暑[あつ]い。', answer: 'にもまして', translation: 'Este año hace todavía más calor que el año pasado.' },
  { sentence: '彼女[かのじょ]は以前[いぜん]___美[うつく]しくなった。', answer: 'にもまして', translation: 'Ella se puso todavía más linda que antes.' },

  // 〜すら (hasta, incluso — más formal que さえ)
  { sentence: '子供[こども]___知[し]っている常識[じょうしき]だ。', answer: 'すら', translation: 'Es de conocimiento común, hasta los niños lo saben.' },
  { sentence: '彼[かれ]は自分[じぶん]の名前[なまえ]___忘[わす]れてしまった。', answer: 'すら', translation: 'Se olvidó hasta de su propio nombre.' },
];

const grammarN1Items = GRAMMAR_N1.map((raw, i) =>
  toItem(raw, i, 'grammar-n1-patrones', 'n1-patrones'),
);

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
  {
    id: 'grammar-n3-patrones',
    title: 'N3 — Patrones gramaticales',
    level: 'N3',
    items: grammarN3Items,
  },
  {
    id: 'grammar-n2-patrones',
    title: 'N2 — Patrones gramaticales',
    level: 'N2',
    items: grammarN2Items,
  },
  {
    id: 'grammar-n1-patrones',
    title: 'N1 — Patrones gramaticales',
    level: 'N1',
    items: grammarN1Items,
  },
];

// Reexportado por si el front necesita listar las partículas cubiertas.
export const N5_PARTICLES = PARTICLE_ANSWERS;
