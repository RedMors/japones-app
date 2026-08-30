/**
 * Practicar cada fila de kana (ej. さしすせそ) en oraciones cortas reales,
 * no sueltas — para reconocerla escuchando y tocando el caracter correcto,
 * no solo memorizarla aislada. Mecánica tipo Duolingo "escuchá y
 * seleccioná": se escucha la oración completa, se arma tocando fichas de
 * kana en el orden que suenan (banco = fichas correctas + distractores),
 * cada ficha también suena sola al tocarla para poder verificar de oído
 * antes de confirmar.
 *
 * Cubre las 10 filas básicas del gojūon (あかたなはまやらわん) en hiragana
 * y katakana — el mismo set de 46 caracteres que `/caracteres` (básico, sin
 * dakuten/yōon). Curado a mano, mismo criterio que gramática y `/temas`:
 * oraciones N5 reales (no inventadas), sin espacios entre palabras — el
 * japonés no los usa. No restringidas a "solo kana ya visto en filas
 * anteriores" (eso volvería todo artificial, です mismo usa で, de la fila
 * た); el criterio es que la fila objetivo aparezca seguido, no que sea lo
 * único presente.
 *
 * Filas や, わ y ん en katakana tienen mucho menos vocabulario real
 * disponible (ヲ casi no se usa, ヤユヨ dan pocas palabras extranjeras) — sus
 * pools son más chicos a propósito, preferible eso a rellenar con ejemplos
 * forzados o mal formados.
 *
 * El pool de cada fila es más grande que una sesión (`SESSION_SIZE`) para
 * que "otra sesión" con la misma fila muestre una mezcla distinta, no
 * exactamente lo mismo — salvo en las filas más chicas, donde el pool
 * entero cabe en una sola sesión.
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
    id: 'hiragana-a',
    kind: 'hiragana',
    chars: 'あいうえお',
    sentences: [
      { id: 'ha1', jp: 'あめがふります。', reading: 'ame ga furimasu.', translation: 'Llueve.' },
      { id: 'ha2', jp: 'いえにかえります。', reading: 'ie ni kaerimasu.', translation: 'Vuelvo a casa.' },
      { id: 'ha3', jp: 'うみがすきです。', reading: 'umi ga suki desu.', translation: 'Me gusta el mar.' },
      { id: 'ha4', jp: 'えいがをみます。', reading: 'eiga wo mimasu.', translation: 'Veo una película.' },
      { id: 'ha5', jp: 'おちゃをのみます。', reading: 'ocha wo nomimasu.', translation: 'Tomo té.' },
      { id: 'ha6', jp: 'あさごはんをたべます。', reading: 'asagohan wo tabemasu.', translation: 'Como el desayuno.' },
      { id: 'ha7', jp: 'いぬがいます。', reading: 'inu ga imasu.', translation: 'Hay un perro.' },
      { id: 'ha8', jp: 'うたをうたいます。', reading: 'uta wo utaimasu.', translation: 'Canto una canción.' },
      { id: 'ha9', jp: 'えきまであるきます。', reading: 'eki made arukimasu.', translation: 'Camino hasta la estación.' },
      { id: 'ha10', jp: 'おおきいいえです。', reading: 'ookii ie desu.', translation: 'Es una casa grande.' },
    ],
  },
  {
    id: 'hiragana-ka',
    kind: 'hiragana',
    chars: 'かきくけこ',
    sentences: [
      { id: 'hka1', jp: 'かさをかいました。', reading: 'kasa wo kaimashita.', translation: 'Compré un paraguas.' },
      { id: 'hka2', jp: 'きれいなはなです。', reading: 'kirei na hana desu.', translation: 'Es una flor linda.' },
      { id: 'hka3', jp: 'くるまでいきます。', reading: 'kuruma de ikimasu.', translation: 'Voy en auto.' },
      { id: 'hka4', jp: 'けさはさむいです。', reading: 'kesa wa samui desu.', translation: 'Esta mañana hace frío.' },
      { id: 'hka5', jp: 'こどもがすきです。', reading: 'kodomo ga suki desu.', translation: 'Me gustan los niños.' },
      { id: 'hka6', jp: 'かいしゃにいきます。', reading: 'kaisha ni ikimasu.', translation: 'Voy a la oficina.' },
      { id: 'hka7', jp: 'かぎをなくしました。', reading: 'kagi wo nakushimashita.', translation: 'Perdí la llave.' },
      { id: 'hka8', jp: 'くつをはきます。', reading: 'kutsu wo hakimasu.', translation: 'Me pongo los zapatos.' },
      { id: 'hka9', jp: 'けいたいをわすれました。', reading: 'keitai wo wasuremashita.', translation: 'Me olvidé el celular.' },
      { id: 'hka10', jp: 'こうえんであそびます。', reading: 'kouen de asobimasu.', translation: 'Juego en el parque.' },
    ],
  },
  {
    id: 'hiragana-ta',
    kind: 'hiragana',
    chars: 'たちつてと',
    sentences: [
      { id: 'hta1', jp: 'たかいたてものです。', reading: 'takai tatemono desu.', translation: 'Es un edificio alto.' },
      { id: 'hta2', jp: 'ちいさいねこです。', reading: 'chiisai neko desu.', translation: 'Es un gato pequeño.' },
      { id: 'hta3', jp: 'つくえのうえにあります。', reading: 'tsukue no ue ni arimasu.', translation: 'Está sobre el escritorio.' },
      { id: 'hta4', jp: 'てがみをかきます。', reading: 'tegami wo kakimasu.', translation: 'Escribo una carta.' },
      { id: 'hta5', jp: 'ともだちにあいます。', reading: 'tomodachi ni aimasu.', translation: 'Me encuentro con un amigo.' },
      { id: 'hta6', jp: 'たべものがおおいです。', reading: 'tabemono ga ooi desu.', translation: 'Hay mucha comida.' },
      { id: 'hta7', jp: 'ちかてつでいきます。', reading: 'chikatetsu de ikimasu.', translation: 'Voy en metro.' },
      { id: 'hta8', jp: 'つめたいみずをのみます。', reading: 'tsumetai mizu wo nomimasu.', translation: 'Tomo agua fría.' },
      { id: 'hta9', jp: 'てんきがいいです。', reading: 'tenki ga ii desu.', translation: 'El clima está bueno.' },
      { id: 'hta10', jp: 'とけいをかいました。', reading: 'tokei wo kaimashita.', translation: 'Compré un reloj.' },
    ],
  },
  {
    id: 'hiragana-na',
    kind: 'hiragana',
    chars: 'なにぬねの',
    sentences: [
      { id: 'hna1', jp: 'なつがすきです。', reading: 'natsu ga suki desu.', translation: 'Me gusta el verano.' },
      { id: 'hna2', jp: 'にほんごをべんきょうします。', reading: 'nihongo wo benkyoushimasu.', translation: 'Estudio japonés.' },
      { id: 'hna3', jp: 'ぬのでつくりました。', reading: 'nuno de tsukurimashita.', translation: 'Lo hice con tela.' },
      { id: 'hna4', jp: 'ねこがねています。', reading: 'neko ga neteimasu.', translation: 'El gato está durmiendo.' },
      { id: 'hna5', jp: 'のみものをください。', reading: 'nomimono wo kudasai.', translation: 'Una bebida, por favor.' },
      { id: 'hna6', jp: 'なまえをかいてください。', reading: 'namae wo kaite kudasai.', translation: 'Escriba su nombre, por favor.' },
      { id: 'hna7', jp: 'にわにはながあります。', reading: 'niwa ni hana ga arimasu.', translation: 'Hay flores en el jardín.' },
      { id: 'hna8', jp: 'ぬいぐるみがすきです。', reading: 'nuigurumi ga suki desu.', translation: 'Me gustan los peluches.' },
      { id: 'hna9', jp: 'ねだんがたかいです。', reading: 'nedan ga takai desu.', translation: 'El precio es caro.' },
      { id: 'hna10', jp: 'のどがかわきました。', reading: 'nodo ga kawakimashita.', translation: 'Tengo sed.' },
    ],
  },
  {
    id: 'hiragana-ha',
    kind: 'hiragana',
    chars: 'はひふへほ',
    sentences: [
      { id: 'hha1', jp: 'はなびがきれいです。', reading: 'hanabi ga kirei desu.', translation: 'Los fuegos artificiales son lindos.' },
      { id: 'hha2', jp: 'ひこうきにのります。', reading: 'hikouki ni norimasu.', translation: 'Subo a un avión.' },
      { id: 'hha3', jp: 'ふゆはさむいです。', reading: 'fuyu wa samui desu.', translation: 'El invierno es frío.' },
      { id: 'hha4', jp: 'へやをそうじします。', reading: 'heya wo souji shimasu.', translation: 'Limpio el cuarto.' },
      { id: 'hha5', jp: 'ほんをよみます。', reading: 'hon wo yomimasu.', translation: 'Leo un libro.' },
      { id: 'hha6', jp: 'はやくきてください。', reading: 'hayaku kite kudasai.', translation: 'Venga rápido, por favor.' },
      { id: 'hha7', jp: 'ひとがおおいです。', reading: 'hito ga ooi desu.', translation: 'Hay mucha gente.' },
      { id: 'hha8', jp: 'ふくをかいました。', reading: 'fuku wo kaimashita.', translation: 'Compré ropa.' },
      { id: 'hha9', jp: 'へたですががんばります。', reading: 'heta desu ga ganbarimasu.', translation: 'No soy bueno, pero me esfuerzo.' },
      { id: 'hha10', jp: 'ほしがきれいです。', reading: 'hoshi ga kirei desu.', translation: 'Las estrellas son lindas.' },
    ],
  },
  {
    id: 'hiragana-ma',
    kind: 'hiragana',
    chars: 'まみむめも',
    sentences: [
      { id: 'hma1', jp: 'まいにちはしります。', reading: 'mainichi hashirimasu.', translation: 'Corro todos los días.' },
      { id: 'hma2', jp: 'みずをください。', reading: 'mizu wo kudasai.', translation: 'Agua, por favor.' },
      { id: 'hma3', jp: 'むずかしいもんだいです。', reading: 'muzukashii mondai desu.', translation: 'Es un problema difícil.' },
      { id: 'hma4', jp: 'めがいたいです。', reading: 'me ga itai desu.', translation: 'Me duelen los ojos.' },
      { id: 'hma5', jp: 'ものがたりをよみます。', reading: 'monogatari wo yomimasu.', translation: 'Leo un cuento.' },
      { id: 'hma6', jp: 'まどをあけてください。', reading: 'mado wo akete kudasai.', translation: 'Abra la ventana, por favor.' },
      { id: 'hma7', jp: 'みちがわかりません。', reading: 'michi ga wakarimasen.', translation: 'No sé el camino.' },
      { id: 'hma8', jp: 'むかしのはなしです。', reading: 'mukashi no hanashi desu.', translation: 'Es una historia antigua.' },
      { id: 'hma9', jp: 'めがねをかけます。', reading: 'megane wo kakemasu.', translation: 'Me pongo los anteojos.' },
      { id: 'hma10', jp: 'もんだいありません。', reading: 'mondai arimasen.', translation: 'No hay problema.' },
    ],
  },
  {
    id: 'hiragana-ya',
    kind: 'hiragana',
    chars: 'やゆよ',
    sentences: [
      { id: 'hya1', jp: 'やさいがすきです。', reading: 'yasai ga suki desu.', translation: 'Me gustan las verduras.' },
      { id: 'hya2', jp: 'ゆきがふっています。', reading: 'yuki ga futteimasu.', translation: 'Está nevando.' },
      { id: 'hya3', jp: 'よるはしずかです。', reading: 'yoru wa shizuka desu.', translation: 'La noche es tranquila.' },
      { id: 'hya4', jp: 'やすみがほしいです。', reading: 'yasumi ga hoshii desu.', translation: 'Quiero un descanso.' },
      { id: 'hya5', jp: 'ゆうめいなひとです。', reading: 'yuumei na hito desu.', translation: 'Es una persona famosa.' },
      { id: 'hya6', jp: 'よやくをしました。', reading: 'yoyaku wo shimashita.', translation: 'Hice una reserva.' },
      { id: 'hya7', jp: 'やまにのぼります。', reading: 'yama ni noborimasu.', translation: 'Subo a la montaña.' },
      { id: 'hya8', jp: 'ゆびがいたいです。', reading: 'yubi ga itai desu.', translation: 'Me duele el dedo.' },
      { id: 'hya9', jp: 'よていがあります。', reading: 'yotei ga arimasu.', translation: 'Tengo planes.' },
      { id: 'hya10', jp: 'やちんがたかいです。', reading: 'yachin ga takai desu.', translation: 'El alquiler es caro.' },
    ],
  },
  {
    id: 'hiragana-ra',
    kind: 'hiragana',
    chars: 'らりるれろ',
    sentences: [
      { id: 'hra1', jp: 'らいねんにほんへいきます。', reading: 'rainen nihon e ikimasu.', translation: 'El año que viene voy a Japón.' },
      { id: 'hra2', jp: 'りんごをたべます。', reading: 'ringo wo tabemasu.', translation: 'Como una manzana.' },
      { id: 'hra3', jp: 'るすです。', reading: 'rusu desu.', translation: 'No está en casa.' },
      { id: 'hra4', jp: 'れいぞうこにあります。', reading: 'reizouko ni arimasu.', translation: 'Está en la heladera.' },
      { id: 'hra5', jp: 'ろうかをあるきます。', reading: 'rouka wo arukimasu.', translation: 'Camino por el pasillo.' },
      { id: 'hra6', jp: 'らくなしごとです。', reading: 'raku na shigoto desu.', translation: 'Es un trabajo fácil.' },
      { id: 'hra7', jp: 'りゆうがわかりません。', reading: 'riyuu ga wakarimasen.', translation: 'No entiendo la razón.' },
      { id: 'hra8', jp: 'るーるをまもります。', reading: 'ruuru wo mamorimasu.', translation: 'Sigo las reglas.' },
      { id: 'hra9', jp: 'れきしがすきです。', reading: 'rekishi ga suki desu.', translation: 'Me gusta la historia.' },
      { id: 'hra10', jp: 'ろくじにおきます。', reading: 'rokuji ni okimasu.', translation: 'Me levanto a las 6.' },
    ],
  },
  {
    id: 'hiragana-wa',
    kind: 'hiragana',
    chars: 'わを',
    sentences: [
      { id: 'hwa1', jp: 'わたしはがくせいです。', reading: 'watashi wa gakusei desu.', translation: 'Yo soy estudiante.' },
      { id: 'hwa2', jp: 'これをください。', reading: 'kore wo kudasai.', translation: 'Esto, por favor.' },
      { id: 'hwa3', jp: 'わすれものをしました。', reading: 'wasuremono wo shimashita.', translation: 'Me olvidé algo.' },
      { id: 'hwa4', jp: 'わかりました。', reading: 'wakarimashita.', translation: 'Entendido.' },
      { id: 'hwa5', jp: 'ほんをよみました。', reading: 'hon wo yomimashita.', translation: 'Leí un libro.' },
      { id: 'hwa6', jp: 'わらいました。', reading: 'waraimashita.', translation: 'Me reí.' },
      { id: 'hwa7', jp: 'わるいてんきです。', reading: 'warui tenki desu.', translation: 'Es mal clima.' },
      { id: 'hwa8', jp: 'おさけをのみました。', reading: 'osake wo nomimashita.', translation: 'Tomé alcohol.' },
      { id: 'hwa9', jp: 'わたしのかばんです。', reading: 'watashi no kaban desu.', translation: 'Es mi bolso.' },
      { id: 'hwa10', jp: 'でんわをかけます。', reading: 'denwa wo kakemasu.', translation: 'Hago una llamada.' },
    ],
  },
  {
    id: 'hiragana-n',
    kind: 'hiragana',
    chars: 'ん',
    sentences: [
      { id: 'hn1', jp: 'ほんがたくさんあります。', reading: 'hon ga takusan arimasu.', translation: 'Hay muchos libros.' },
      { id: 'hn2', jp: 'せんせいにききました。', reading: 'sensei ni kikimashita.', translation: 'Le pregunté al profesor.' },
      { id: 'hn3', jp: 'でんしゃにのります。', reading: 'densha ni norimasu.', translation: 'Subo al tren.' },
      { id: 'hn4', jp: 'にほんごをはなします。', reading: 'nihongo wo hanashimasu.', translation: 'Hablo japonés.' },
      { id: 'hn5', jp: 'ぜんぶたべました。', reading: 'zenbu tabemashita.', translation: 'Comí todo.' },
      { id: 'hn6', jp: 'あんぜんです。', reading: 'anzen desu.', translation: 'Es seguro.' },
      { id: 'hn7', jp: 'しんぶんをよみます。', reading: 'shinbun wo yomimasu.', translation: 'Leo el diario.' },
      { id: 'hn8', jp: 'けんこうがだいじです。', reading: 'kenkou ga daiji desu.', translation: 'La salud es importante.' },
      { id: 'hn9', jp: 'うんどうをします。', reading: 'undou wo shimasu.', translation: 'Hago ejercicio.' },
      { id: 'hn10', jp: 'しんせつなひとです。', reading: 'shinsetsu na hito desu.', translation: 'Es una persona amable.' },
    ],
  },
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
    id: 'katakana-a',
    kind: 'katakana',
    chars: 'アイウエオ',
    sentences: [
      { id: 'ka1', jp: 'アイスをたべます。', reading: 'aisu wo tabemasu.', translation: 'Como helado.' },
      { id: 'ka2', jp: 'イヤホンをつけます。', reading: 'iyahon wo tsukemasu.', translation: 'Me pongo los auriculares.' },
      { id: 'ka3', jp: 'ウイスキーをのみます。', reading: 'uisukii wo nomimasu.', translation: 'Tomo whisky.' },
      { id: 'ka4', jp: 'エレベーターでいきます。', reading: 'erebeetaa de ikimasu.', translation: 'Voy en ascensor.' },
      { id: 'ka5', jp: 'オレンジがすきです。', reading: 'orenji ga suki desu.', translation: 'Me gusta la naranja.' },
      { id: 'ka6', jp: 'アパートにすんでいます。', reading: 'apaato ni sundeimasu.', translation: 'Vivo en un apartamento.' },
      { id: 'ka7', jp: 'アニメをみます。', reading: 'anime wo mimasu.', translation: 'Veo anime.' },
      { id: 'ka8', jp: 'イメージがちがいます。', reading: 'imeeji ga chigaimasu.', translation: 'La imagen es diferente.' },
      { id: 'ka9', jp: 'ウールのセーターです。', reading: 'uuru no seetaa desu.', translation: 'Es un suéter de lana.' },
      { id: 'ka10', jp: 'オフィスではたらきます。', reading: 'ofisu de hatarakimasu.', translation: 'Trabajo en la oficina.' },
    ],
  },
  {
    id: 'katakana-ka',
    kind: 'katakana',
    chars: 'カキクケコ',
    sentences: [
      { id: 'kka1', jp: 'カメラをかいました。', reading: 'kamera wo kaimashita.', translation: 'Compré una cámara.' },
      { id: 'kka2', jp: 'キーをなくしました。', reading: 'kii wo nakushimashita.', translation: 'Perdí la llave.' },
      { id: 'kka3', jp: 'クッキーをたべます。', reading: 'kukkii wo tabemasu.', translation: 'Como galletas.' },
      { id: 'kka4', jp: 'ケーキがおいしいです。', reading: 'keeki ga oishii desu.', translation: 'El pastel está rico.' },
      { id: 'kka5', jp: 'コーヒーをのみます。', reading: 'koohii wo nomimasu.', translation: 'Tomo café.' },
      { id: 'kka6', jp: 'カレーがすきです。', reading: 'karee ga suki desu.', translation: 'Me gusta el curry.' },
      { id: 'kka7', jp: 'カードではらいます。', reading: 'kaado de haraimasu.', translation: 'Pago con tarjeta.' },
      { id: 'kka8', jp: 'クラスがはじまります。', reading: 'kurasu ga hajimarimasu.', translation: 'Empieza la clase.' },
      { id: 'kka9', jp: 'ケースにいれます。', reading: 'keesu ni iremasu.', translation: 'Lo pongo en el estuche.' },
      { id: 'kka10', jp: 'コンピューターをつかいます。', reading: 'konpyuutaa wo tsukaimasu.', translation: 'Uso la computadora.' },
    ],
  },
  {
    id: 'katakana-ta',
    kind: 'katakana',
    chars: 'タチツテト',
    sentences: [
      { id: 'kta1', jp: 'タクシーをよびます。', reading: 'takushii wo yobimasu.', translation: 'Llamo un taxi.' },
      { id: 'kta2', jp: 'チームにはいります。', reading: 'chiimu ni hairimasu.', translation: 'Me uno al equipo.' },
      { id: 'kta3', jp: 'ツアーにさんかします。', reading: 'tsuaa ni sankashimasu.', translation: 'Participo en un tour.' },
      { id: 'kta4', jp: 'テレビをみます。', reading: 'terebi wo mimasu.', translation: 'Veo televisión.' },
      { id: 'kta5', jp: 'トマトをかいました。', reading: 'tomato wo kaimashita.', translation: 'Compré tomates.' },
      { id: 'kta6', jp: 'タオルをください。', reading: 'taoru wo kudasai.', translation: 'Una toalla, por favor.' },
      { id: 'kta7', jp: 'テストがむずかしかったです。', reading: 'tesuto ga muzukashikatta desu.', translation: 'El examen estuvo difícil.' },
      { id: 'kta8', jp: 'トイレはどこですか。', reading: 'toire wa doko desu ka.', translation: '¿Dónde está el baño?' },
      { id: 'kta9', jp: 'チケットをかいました。', reading: 'chiketto wo kaimashita.', translation: 'Compré un boleto.' },
      { id: 'kta10', jp: 'テーブルにおきます。', reading: 'teeburu ni okimasu.', translation: 'Lo pongo en la mesa.' },
    ],
  },
  {
    id: 'katakana-na',
    kind: 'katakana',
    chars: 'ナニヌネノ',
    sentences: [
      { id: 'kna1', jp: 'ナイフをつかいます。', reading: 'naifu wo tsukaimasu.', translation: 'Uso el cuchillo.' },
      { id: 'kna2', jp: 'ニュースをみます。', reading: 'nyuusu wo mimasu.', translation: 'Veo las noticias.' },
      { id: 'kna3', jp: 'ヌードルがすきです。', reading: 'nuudoru ga suki desu.', translation: 'Me gustan los fideos instantáneos.' },
      { id: 'kna4', jp: 'ネクタイをします。', reading: 'nekutai wo shimasu.', translation: 'Me pongo la corbata.' },
      { id: 'kna5', jp: 'ノートをかいました。', reading: 'nooto wo kaimashita.', translation: 'Compré un cuaderno.' },
      { id: 'kna6', jp: 'ナンバーをおしえてください。', reading: 'nanbaa wo oshiete kudasai.', translation: 'Dígame el número, por favor.' },
      { id: 'kna7', jp: 'ナポリタンをたべます。', reading: 'naporitan wo tabemasu.', translation: 'Como espagueti napolitana.' },
      { id: 'kna8', jp: 'ネットでしらべます。', reading: 'netto de shirabemasu.', translation: 'Busco en internet.' },
      { id: 'kna9', jp: 'ノックしてください。', reading: 'nokku shite kudasai.', translation: 'Toque la puerta, por favor.' },
      { id: 'kna10', jp: 'ニットがあたたかいです。', reading: 'nitto ga atatakai desu.', translation: 'El suéter tejido es abrigado.' },
    ],
  },
  {
    id: 'katakana-ha',
    kind: 'katakana',
    chars: 'ハヒフヘホ',
    sentences: [
      { id: 'kha1', jp: 'ハンカチをわすれました。', reading: 'hankachi wo wasuremashita.', translation: 'Me olvidé el pañuelo.' },
      { id: 'kha2', jp: 'ヒーターをつけます。', reading: 'hiitaa wo tsukemasu.', translation: 'Prendo el calefactor.' },
      { id: 'kha3', jp: 'フォークをつかいます。', reading: 'fooku wo tsukaimasu.', translation: 'Uso el tenedor.' },
      { id: 'kha4', jp: 'ヘアスタイルをかえました。', reading: 'heasutairu wo kaemashita.', translation: 'Cambié de peinado.' },
      { id: 'kha5', jp: 'ホテルにとまります。', reading: 'hoteru ni tomarimasu.', translation: 'Me alojo en un hotel.' },
      { id: 'kha6', jp: 'ハンバーガーをたべます。', reading: 'hanbaagaa wo tabemasu.', translation: 'Como una hamburguesa.' },
      { id: 'kha7', jp: 'ヒントをください。', reading: 'hinto wo kudasai.', translation: 'Deme una pista, por favor.' },
      { id: 'kha8', jp: 'フルーツがすきです。', reading: 'furuutsu ga suki desu.', translation: 'Me gusta la fruta.' },
      { id: 'kha9', jp: 'ヘルメットをかぶります。', reading: 'herumetto wo kaburimasu.', translation: 'Me pongo el casco.' },
      { id: 'kha10', jp: 'ホームでまちます。', reading: 'hoomu de machimasu.', translation: 'Espero en el andén.' },
    ],
  },
  {
    id: 'katakana-ma',
    kind: 'katakana',
    chars: 'マミムメモ',
    sentences: [
      { id: 'kma1', jp: 'マンションにすんでいます。', reading: 'manshon ni sundeimasu.', translation: 'Vivo en un departamento.' },
      { id: 'kma2', jp: 'ミルクをのみます。', reading: 'miruku wo nomimasu.', translation: 'Tomo leche.' },
      { id: 'kma3', jp: 'ムードがいいです。', reading: 'muudo ga ii desu.', translation: 'Hay buen ambiente.' },
      { id: 'kma4', jp: 'メニューをください。', reading: 'menyuu wo kudasai.', translation: 'El menú, por favor.' },
      { id: 'kma5', jp: 'モデルになりたいです。', reading: 'moderu ni naritai desu.', translation: 'Quiero ser modelo.' },
      { id: 'kma6', jp: 'マスクをします。', reading: 'masuku wo shimasu.', translation: 'Me pongo el barbijo.' },
      { id: 'kma7', jp: 'ミーティングがあります。', reading: 'miitingu ga arimasu.', translation: 'Hay una reunión.' },
      { id: 'kma8', jp: 'メールをおくります。', reading: 'meeru wo okurimasu.', translation: 'Mando un mail.' },
      { id: 'kma9', jp: 'モニターがおおきいです。', reading: 'monitaa ga ookii desu.', translation: 'El monitor es grande.' },
      { id: 'kma10', jp: 'マラソンをはしります。', reading: 'marason wo hashirimasu.', translation: 'Corro un maratón.' },
    ],
  },
  {
    id: 'katakana-ya',
    kind: 'katakana',
    chars: 'ヤユヨ',
    sentences: [
      { id: 'kya1', jp: 'タイヤがパンクしました。', reading: 'taiya ga panku shimashita.', translation: 'Se pinchó la rueda.' },
      { id: 'kya2', jp: 'ユーモアがあります。', reading: 'yuumoa ga arimasu.', translation: 'Tiene sentido del humor.' },
      { id: 'kya3', jp: 'ヨーロッパにいきたいです。', reading: 'yooroppa ni ikitai desu.', translation: 'Quiero ir a Europa.' },
      { id: 'kya4', jp: 'パパイヤをたべます。', reading: 'papaiya wo tabemasu.', translation: 'Como papaya.' },
      { id: 'kya5', jp: 'ユニークなデザインです。', reading: 'yuniiku na dezain desu.', translation: 'Es un diseño único.' },
      { id: 'kya6', jp: 'ヨガをします。', reading: 'yoga wo shimasu.', translation: 'Hago yoga.' },
      { id: 'kya7', jp: 'ダイヤモンドです。', reading: 'daiyamondo desu.', translation: 'Es un diamante.' },
      { id: 'kya8', jp: 'ヨットにのります。', reading: 'yotto ni norimasu.', translation: 'Subo a un velero.' },
    ],
  },
  {
    id: 'katakana-ra',
    kind: 'katakana',
    chars: 'ラリルレロ',
    sentences: [
      { id: 'kra1', jp: 'ラーメンをたべます。', reading: 'raamen wo tabemasu.', translation: 'Como ramen.' },
      { id: 'kra2', jp: 'リモコンをください。', reading: 'rimokon wo kudasai.', translation: 'El control remoto, por favor.' },
      { id: 'kra3', jp: 'ルールをまもります。', reading: 'ruuru wo mamorimasu.', translation: 'Sigo las reglas.' },
      { id: 'kra4', jp: 'レストランでたべます。', reading: 'resutoran de tabemasu.', translation: 'Como en un restaurante.' },
      { id: 'kra5', jp: 'ロボットがうごきます。', reading: 'robotto ga ugokimasu.', translation: 'El robot se mueve.' },
      { id: 'kra6', jp: 'ライトをつけます。', reading: 'raito wo tsukemasu.', translation: 'Prendo la luz.' },
      { id: 'kra7', jp: 'リストをつくります。', reading: 'risuto wo tsukurimasu.', translation: 'Hago una lista.' },
      { id: 'kra8', jp: 'レモンがすっぱいです。', reading: 'remon ga suppai desu.', translation: 'El limón es ácido.' },
      { id: 'kra9', jp: 'ロビーでまちます。', reading: 'robii de machimasu.', translation: 'Espero en el lobby.' },
      { id: 'kra10', jp: 'ラジオをききます。', reading: 'rajio wo kikimasu.', translation: 'Escucho la radio.' },
    ],
  },
  {
    id: 'katakana-wa',
    kind: 'katakana',
    chars: 'ワヲ',
    sentences: [
      { id: 'kwa1', jp: 'ワインをのみます。', reading: 'wain wo nomimasu.', translation: 'Tomo vino.' },
      { id: 'kwa2', jp: 'ワイシャツをきます。', reading: 'waishatsu wo kimasu.', translation: 'Me pongo la camisa.' },
      { id: 'kwa3', jp: 'ワンピースをかいました。', reading: 'wanpiisu wo kaimashita.', translation: 'Compré un vestido.' },
      { id: 'kwa4', jp: 'ワッフルがすきです。', reading: 'waffuru ga suki desu.', translation: 'Me gustan los waffles.' },
      { id: 'kwa5', jp: 'ワクチンをうけました。', reading: 'wakuchin wo ukemashita.', translation: 'Me di la vacuna.' },
      { id: 'kwa6', jp: 'ワイヤレスイヤホンです。', reading: 'waiyaresu iyahon desu.', translation: 'Son auriculares inalámbricos.' },
      { id: 'kwa7', jp: 'ハワイにいきたいです。', reading: 'hawai ni ikitai desu.', translation: 'Quiero ir a Hawái.' },
    ],
  },
  {
    id: 'katakana-n',
    kind: 'katakana',
    chars: 'ン',
    sentences: [
      { id: 'kn1', jp: 'パンをかいます。', reading: 'pan wo kaimasu.', translation: 'Compro pan.' },
      { id: 'kn2', jp: 'ペンをかしてください。', reading: 'pen wo kashite kudasai.', translation: 'Préstame un bolígrafo, por favor.' },
      { id: 'kn3', jp: 'ボタンをおします。', reading: 'botan wo oshimasu.', translation: 'Aprieto el botón.' },
      { id: 'kn4', jp: 'レストランにいきます。', reading: 'resutoran ni ikimasu.', translation: 'Voy a un restaurante.' },
      { id: 'kn5', jp: 'スプーンをつかいます。', reading: 'supuun wo tsukaimasu.', translation: 'Uso la cuchara.' },
      { id: 'kn6', jp: 'ファッションがすきです。', reading: 'fasshon ga suki desu.', translation: 'Me gusta la moda.' },
      { id: 'kn7', jp: 'ライオンをみました。', reading: 'raion wo mimashita.', translation: 'Vi un león.' },
      { id: 'kn8', jp: 'サンドイッチをたべます。', reading: 'sandoicchi wo tabemasu.', translation: 'Como un sándwich.' },
      { id: 'kn9', jp: 'コンサートにいきます。', reading: 'konsaato ni ikimasu.', translation: 'Voy a un concierto.' },
      { id: 'kn10', jp: 'デザインがいいです。', reading: 'dezain ga ii desu.', translation: 'El diseño es bueno.' },
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
