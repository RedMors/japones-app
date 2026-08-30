import { UtensilsCrossed, Car, Handshake, ShoppingBag, Briefcase, type LucideIcon } from 'lucide-react';

/**
 * Frases por escena/nicho (restaurante, calle, cultura): no es progresión
 * JLPT, es repetición de frases hechas y conjugaciones típicas de un
 * contexto real, para el ejercicio "escuchá y armá la oración" (sin ver el
 * texto primero, como el bank de palabras de Duolingo).
 *
 * Contenido curado a mano, mismo criterio que la gramática: frases hechas
 * estándar de cualquier curso (Genki, Minna no Nihongo), no inventadas.
 * `tiles` son los fragmentos tocables en orden correcto — cada uno puede
 * traer su propia furigana (mismo formato que el resto de la app).
 */
export type ScenePhrase = {
  id: string;
  tiles: string[];
  translation: string;
};

/** Vocabulario visual: "¿cuál de estas imágenes es X?" — imágenes generadas
 *  por IA y cacheadas en disco (lib/image-cache.ts), nunca regeneradas para
 *  el mismo prompt. `imagePrompt` va en inglés, estilo ícono plano simple,
 *  no fotorrealista (más barato y consistente). */
export type SceneImageItem = {
  id: string;
  word: string;
  reading: string;
  translation: string;
  imagePrompt: string;
};

export type SceneTheme = {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  phrases: ScenePhrase[];
  imageItems?: SceneImageItem[];
};

export const SCENE_THEMES: SceneTheme[] = [
  {
    id: 'restaurante',
    title: 'Restaurante',
    icon: UtensilsCrossed,
    description: 'Pedir, pagar, agradecer la comida.',
    imageItems: [
      {
        id: 'img-sushi',
        word: 'すし',
        reading: 'sushi',
        translation: 'sushi',
        imagePrompt:
          'a plate of sushi rolls, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-ocha',
        word: 'お茶[ちゃ]',
        reading: 'ocha',
        translation: 'té verde',
        imagePrompt:
          'a cup of green tea, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-mizu',
        word: '水[みず]',
        reading: 'mizu',
        translation: 'agua',
        imagePrompt:
          'a glass of water, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-hashi',
        word: 'お箸[はし]',
        reading: 'ohashi',
        translation: 'palitos chinos',
        imagePrompt:
          'a pair of wooden chopsticks, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-kaikei',
        word: 'お会計[かいけい]',
        reading: 'okaikei',
        translation: 'la cuenta',
        imagePrompt:
          'a restaurant bill receipt on a small tray, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-menu',
        word: 'メニュー',
        reading: 'menyuu',
        translation: 'menú',
        imagePrompt:
          'a restaurant menu booklet, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
    ],
    phrases: [
      { id: 'r1', tiles: ['これ', 'を', 'ください'], translation: 'Esto, por favor.' },
      {
        id: 'r2',
        tiles: ['お会計[かいけい]を', 'お願[ねが]いします'],
        translation: 'La cuenta, por favor.',
      },
      { id: 'r3', tiles: ['もう', '一[ひと]つ', 'ください'], translation: 'Uno más, por favor.' },
      {
        id: 'r4',
        tiles: ['すみません', '、', '水[みず]を', 'ください'],
        translation: 'Disculpe, agua por favor.',
      },
      { id: 'r5', tiles: ['おいしかった', 'です'], translation: 'Estuvo rico.' },
      {
        id: 'r6',
        tiles: ['予約[よやく]を', 'したい', 'です'],
        translation: 'Quiero hacer una reserva.',
      },
    ],
  },
  {
    id: 'calle',
    title: 'En la calle',
    icon: Car,
    description: 'Pedir direcciones, moverte por la ciudad.',
    imageItems: [
      {
        id: 'img-eki',
        word: '駅[えき]',
        reading: 'eki',
        translation: 'estación',
        imagePrompt:
          'a train station entrance sign, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-takushi',
        word: 'タクシー',
        reading: 'takushii',
        translation: 'taxi',
        imagePrompt:
          'a taxi cab, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-chizu',
        word: '地図[ちず]',
        reading: 'chizu',
        translation: 'mapa',
        imagePrompt:
          'a folded paper map, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-shingou',
        word: '信号[しんごう]',
        reading: 'shingou',
        translation: 'semáforo',
        imagePrompt:
          'a traffic light, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-basu',
        word: 'バス',
        reading: 'basu',
        translation: 'colectivo/bus',
        imagePrompt:
          'a city bus, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-kado',
        word: '角[かど]',
        reading: 'kado',
        translation: 'la esquina',
        imagePrompt:
          'a street corner with a signpost, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
    ],
    phrases: [
      {
        id: 'c1',
        tiles: ['すみません', '、', '駅[えき]は', 'どこ', 'ですか'],
        translation: 'Disculpe, ¿dónde está la estación?',
      },
      {
        id: 'c2',
        tiles: ['まっすぐ', '行[い]って', 'ください'],
        translation: 'Siga derecho, por favor.',
      },
      { id: 'c3', tiles: ['ここで', '降[お]ります'], translation: 'Bajo acá.' },
      { id: 'c4', tiles: ['どのくらい', 'かかりますか'], translation: '¿Cuánto tiempo toma?' },
      {
        id: 'c5',
        tiles: ['右[みぎ]に', '曲[ま]がって', 'ください'],
        translation: 'Doble a la derecha, por favor.',
      },
      {
        id: 'c6',
        tiles: ['タクシーを', '呼[よ]んで', 'ください'],
        translation: 'Llame un taxi, por favor.',
      },
    ],
  },
  {
    id: 'cultura',
    title: 'Frases de cortesía',
    icon: Handshake,
    description: 'Lo que se dice siempre, en el momento justo.',
    imageItems: [
      {
        id: 'img-ojigi',
        word: 'お辞儀[じぎ]',
        reading: 'ojigi',
        translation: 'la reverencia (saludo)',
        imagePrompt:
          'a person bowing politely, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-genkan',
        word: '玄関[げんかん]',
        reading: 'genkan',
        translation: 'la entrada de una casa',
        imagePrompt:
          'a Japanese house entrance genkan with shoes lined up, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-hashi-taberu',
        word: '箸[はし]',
        reading: 'hashi',
        translation: 'palitos, para comer',
        imagePrompt:
          'a hand holding chopsticks over a bowl of rice, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-aisatsu',
        word: '挨拶[あいさつ]',
        reading: 'aisatsu',
        translation: 'el saludo',
        imagePrompt:
          'two people greeting each other with a bow, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-shigoto',
        word: '仕事[しごと]',
        reading: 'shigoto',
        translation: 'el trabajo',
        imagePrompt:
          'a briefcase and a desk, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-arigatou',
        word: 'ありがとう',
        reading: 'arigatou',
        translation: 'gracias',
        imagePrompt:
          'two hands pressed together in a thank-you gesture with a small heart, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
    ],
    phrases: [
      { id: 'k1', tiles: ['お邪魔[じゃま]', 'します'], translation: 'Con permiso (al entrar).' },
      { id: 'k2', tiles: ['いただきます'], translation: 'Antes de comer.' },
      { id: 'k3', tiles: ['ごちそうさまでした'], translation: 'Después de comer.' },
      {
        id: 'k4',
        tiles: ['お先[さき]に', '失礼[しつれい]', 'します'],
        translation: 'Me retiro primero (disculpando la descortesía).',
      },
      {
        id: 'k5',
        tiles: ['よろしく', 'お願[ねが]い', 'します'],
        translation: 'Un gusto / cuento con su ayuda.',
      },
      {
        id: 'k6',
        tiles: ['お疲[つか]れ様[さま]', 'でした'],
        translation: 'Buen trabajo (al terminar algo juntos).',
      },
    ],
  },
  {
    // Sin `imageItems` a propósito — el piloto de vocabulario visual sigue
    // acotado (ver comentario de arriba), no expandir sin decisión explícita
    // por el costo real de generación. Esta escena funciona solo con el
    // paso de armar oraciones, igual que Calle y Cortesía en la práctica.
    id: 'compras',
    title: 'De compras',
    icon: ShoppingBag,
    description: 'Preguntar precio, probar talles, pagar.',
    phrases: [
      { id: 'co1', tiles: ['これは', 'いくら', 'ですか'], translation: '¿Cuánto cuesta esto?' },
      {
        id: 'co2',
        tiles: ['もう', 'すこし', 'やすく', 'なりますか'],
        translation: '¿Puede ser un poco más barato?',
      },
      { id: 'co3', tiles: ['カードは', 'つかえますか'], translation: '¿Puedo pagar con tarjeta?' },
      {
        id: 'co4',
        tiles: ['サイズを', 'かえて', 'ください'],
        translation: 'Cámbieme la talla, por favor.',
      },
      { id: 'co5', tiles: ['レシートを', 'ください'], translation: 'El recibo, por favor.' },
      {
        id: 'co6',
        tiles: ['きて', 'みても', 'いいですか'],
        translation: '¿Me lo puedo probar?',
      },
    ],
  },
  {
    // Sin `imageItems`, mismo criterio que "De compras".
    id: 'trabajo',
    title: 'En el trabajo',
    icon: Briefcase,
    description: 'Reuniones, pedidos, salir de la oficina.',
    phrases: [
      {
        id: 'tr1',
        tiles: ['かいぎは', 'なんじから', 'ですか'],
        translation: '¿A qué hora empieza la reunión?',
      },
      {
        id: 'tr2',
        tiles: ['これを', 'コピーして', 'ください'],
        translation: 'Fotocopie esto, por favor.',
      },
      { id: 'tr3', tiles: ['しごとが', 'おわりました'], translation: 'Terminé el trabajo.' },
      {
        id: 'tr4',
        tiles: ['きょうは', 'やすみを', 'とります'],
        translation: 'Hoy tomo el día libre.',
      },
      { id: 'tr5', tiles: ['メールを', 'おくって', 'ください'], translation: 'Mande un mail, por favor.' },
      { id: 'tr6', tiles: ['おさきに', 'しつれいします'], translation: 'Me retiro primero.' },
    ],
  },
];

export function getSceneTheme(id: string): SceneTheme | undefined {
  return SCENE_THEMES.find((t) => t.id === id);
}
