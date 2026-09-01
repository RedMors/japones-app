import { UtensilsCrossed, Car, Handshake, ShoppingBag, Briefcase, type LucideIcon } from 'lucide-react';
import type { Localized } from '@/lib/i18n/localized';

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
  translation: Localized;
};

/** Vocabulario visual: "¿cuál de estas imágenes es X?" — imágenes generadas
 *  por IA y cacheadas en disco (lib/image-cache.ts), nunca regeneradas para
 *  el mismo prompt. `imagePrompt` va en inglés, estilo ícono plano simple,
 *  no fotorrealista (más barato y consistente). */
export type SceneImageItem = {
  id: string;
  word: string;
  reading: string;
  translation: Localized;
  imagePrompt: string;
};

export type SceneTheme = {
  id: string;
  title: Localized;
  icon: LucideIcon;
  description: Localized;
  phrases: ScenePhrase[];
  imageItems?: SceneImageItem[];
};

export const SCENE_THEMES: SceneTheme[] = [
  {
    id: 'restaurante',
    title: { es: 'Restaurante', en: 'Restaurant' },
    icon: UtensilsCrossed,
    description: {
      es: 'Pedir, pagar, agradecer la comida.',
      en: 'Order, pay, thank for the food.',
    },
    imageItems: [
      {
        id: 'img-sushi',
        word: 'すし',
        reading: 'sushi',
        translation: { es: 'sushi', en: 'sushi' },
        imagePrompt:
          'a plate of sushi rolls, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-ocha',
        word: 'お茶[ちゃ]',
        reading: 'ocha',
        translation: { es: 'té verde', en: 'green tea' },
        imagePrompt:
          'a cup of green tea, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-mizu',
        word: '水[みず]',
        reading: 'mizu',
        translation: { es: 'agua', en: 'water' },
        imagePrompt:
          'a glass of water, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-hashi',
        word: 'お箸[はし]',
        reading: 'ohashi',
        translation: { es: 'palitos chinos', en: 'chopsticks' },
        imagePrompt:
          'a pair of wooden chopsticks, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-kaikei',
        word: 'お会計[かいけい]',
        reading: 'okaikei',
        translation: { es: 'la cuenta', en: 'the bill' },
        imagePrompt:
          'a restaurant bill receipt on a small tray, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-menu',
        word: 'メニュー',
        reading: 'menyuu',
        translation: { es: 'menú', en: 'menu' },
        imagePrompt:
          'a restaurant menu booklet, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
    ],
    phrases: [
      {
        id: 'r1',
        tiles: ['これ', 'を', 'ください'],
        translation: { es: 'Esto, por favor.', en: 'This, please.' },
      },
      {
        id: 'r2',
        tiles: ['お会計[かいけい]を', 'お願[ねが]いします'],
        translation: { es: 'La cuenta, por favor.', en: 'The bill, please.' },
      },
      {
        id: 'r3',
        tiles: ['もう', '一[ひと]つ', 'ください'],
        translation: { es: 'Uno más, por favor.', en: 'One more, please.' },
      },
      {
        id: 'r4',
        tiles: ['すみません', '、', '水[みず]を', 'ください'],
        translation: { es: 'Disculpe, agua por favor.', en: 'Excuse me, water please.' },
      },
      {
        id: 'r5',
        tiles: ['おいしかった', 'です'],
        translation: { es: 'Estuvo rico.', en: 'It was delicious.' },
      },
      {
        id: 'r6',
        tiles: ['予約[よやく]を', 'したい', 'です'],
        translation: { es: 'Quiero hacer una reserva.', en: 'I want to make a reservation.' },
      },
    ],
  },
  {
    id: 'calle',
    title: { es: 'En la calle', en: 'On the street' },
    icon: Car,
    description: {
      es: 'Pedir direcciones, moverte por la ciudad.',
      en: 'Ask for directions, get around the city.',
    },
    imageItems: [
      {
        id: 'img-eki',
        word: '駅[えき]',
        reading: 'eki',
        translation: { es: 'estación', en: 'station' },
        imagePrompt:
          'a train station entrance sign, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-takushi',
        word: 'タクシー',
        reading: 'takushii',
        translation: { es: 'taxi', en: 'taxi' },
        imagePrompt:
          'a taxi cab, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-chizu',
        word: '地図[ちず]',
        reading: 'chizu',
        translation: { es: 'mapa', en: 'map' },
        imagePrompt:
          'a folded paper map, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-shingou',
        word: '信号[しんごう]',
        reading: 'shingou',
        translation: { es: 'semáforo', en: 'traffic light' },
        imagePrompt:
          'a traffic light, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-basu',
        word: 'バス',
        reading: 'basu',
        translation: { es: 'colectivo/bus', en: 'bus' },
        imagePrompt:
          'a city bus, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-kado',
        word: '角[かど]',
        reading: 'kado',
        translation: { es: 'la esquina', en: 'the corner' },
        imagePrompt:
          'a street corner with a signpost, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
    ],
    phrases: [
      {
        id: 'c1',
        tiles: ['すみません', '、', '駅[えき]は', 'どこ', 'ですか'],
        translation: { es: 'Disculpe, ¿dónde está la estación?', en: 'Excuse me, where is the station?' },
      },
      {
        id: 'c2',
        tiles: ['まっすぐ', '行[い]って', 'ください'],
        translation: { es: 'Siga derecho, por favor.', en: 'Go straight, please.' },
      },
      {
        id: 'c3',
        tiles: ['ここで', '降[お]ります'],
        translation: { es: 'Bajo acá.', en: "I'm getting off here." },
      },
      {
        id: 'c4',
        tiles: ['どのくらい', 'かかりますか'],
        translation: { es: '¿Cuánto tiempo toma?', en: 'How long does it take?' },
      },
      {
        id: 'c5',
        tiles: ['右[みぎ]に', '曲[ま]がって', 'ください'],
        translation: { es: 'Doble a la derecha, por favor.', en: 'Turn right, please.' },
      },
      {
        id: 'c6',
        tiles: ['タクシーを', '呼[よ]んで', 'ください'],
        translation: { es: 'Llame un taxi, por favor.', en: 'Call a taxi, please.' },
      },
    ],
  },
  {
    id: 'cultura',
    title: { es: 'Frases de cortesía', en: 'Courtesy phrases' },
    icon: Handshake,
    description: {
      es: 'Lo que se dice siempre, en el momento justo.',
      en: 'What you always say, at the right moment.',
    },
    imageItems: [
      {
        id: 'img-ojigi',
        word: 'お辞儀[じぎ]',
        reading: 'ojigi',
        translation: { es: 'la reverencia (saludo)', en: 'the bow (greeting)' },
        imagePrompt:
          'a person bowing politely, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-genkan',
        word: '玄関[げんかん]',
        reading: 'genkan',
        translation: { es: 'la entrada de una casa', en: 'a house entrance' },
        imagePrompt:
          'a Japanese house entrance genkan with shoes lined up, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-hashi-taberu',
        word: '箸[はし]',
        reading: 'hashi',
        translation: { es: 'palitos, para comer', en: 'chopsticks, for eating' },
        imagePrompt:
          'a hand holding chopsticks over a bowl of rice, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-aisatsu',
        word: '挨拶[あいさつ]',
        reading: 'aisatsu',
        translation: { es: 'el saludo', en: 'the greeting' },
        imagePrompt:
          'two people greeting each other with a bow, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-shigoto',
        word: '仕事[しごと]',
        reading: 'shigoto',
        translation: { es: 'el trabajo', en: 'work' },
        imagePrompt:
          'a briefcase and a desk, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
      {
        id: 'img-arigatou',
        word: 'ありがとう',
        reading: 'arigatou',
        translation: { es: 'gracias', en: 'thank you' },
        imagePrompt:
          'two hands pressed together in a thank-you gesture with a small heart, simple flat icon illustration, minimal flat design, plain solid background, no text',
      },
    ],
    phrases: [
      {
        id: 'k1',
        tiles: ['お邪魔[じゃま]', 'します'],
        translation: { es: 'Con permiso (al entrar).', en: 'Excuse me (when entering).' },
      },
      {
        id: 'k2',
        tiles: ['いただきます'],
        translation: { es: 'Antes de comer.', en: 'Before eating.' },
      },
      {
        id: 'k3',
        tiles: ['ごちそうさまでした'],
        translation: { es: 'Después de comer.', en: 'After eating.' },
      },
      {
        id: 'k4',
        tiles: ['お先[さき]に', '失礼[しつれい]', 'します'],
        translation: {
          es: 'Me retiro primero (disculpando la descortesía).',
          en: "I'm leaving first (apologizing for the rudeness).",
        },
      },
      {
        id: 'k5',
        tiles: ['よろしく', 'お願[ねが]い', 'します'],
        translation: {
          es: 'Un gusto / cuento con su ayuda.',
          en: 'Nice to meet you / I appreciate your help.',
        },
      },
      {
        id: 'k6',
        tiles: ['お疲[つか]れ様[さま]', 'でした'],
        translation: {
          es: 'Buen trabajo (al terminar algo juntos).',
          en: 'Good work (after finishing something together).',
        },
      },
    ],
  },
  {
    // Sin `imageItems` a propósito — el piloto de vocabulario visual sigue
    // acotado (ver comentario de arriba), no expandir sin decisión explícita
    // por el costo real de generación. Esta escena funciona solo con el
    // paso de armar oraciones, igual que Calle y Cortesía en la práctica.
    id: 'compras',
    title: { es: 'De compras', en: 'Shopping' },
    icon: ShoppingBag,
    description: {
      es: 'Preguntar precio, probar talles, pagar.',
      en: 'Ask the price, try sizes, pay.',
    },
    phrases: [
      {
        id: 'co1',
        tiles: ['これは', 'いくら', 'ですか'],
        translation: { es: '¿Cuánto cuesta esto?', en: 'How much does this cost?' },
      },
      {
        id: 'co2',
        tiles: ['もう', 'すこし', 'やすく', 'なりますか'],
        translation: { es: '¿Puede ser un poco más barato?', en: 'Can it be a little cheaper?' },
      },
      {
        id: 'co3',
        tiles: ['カードは', 'つかえますか'],
        translation: { es: '¿Puedo pagar con tarjeta?', en: 'Can I pay by card?' },
      },
      {
        id: 'co4',
        tiles: ['ちがう', 'サイズは', 'ありますか'],
        translation: { es: '¿Tienen otra talla?', en: 'Do you have another size?' },
      },
      {
        id: 'co5',
        tiles: ['レシートを', 'ください'],
        translation: { es: 'El recibo, por favor.', en: 'The receipt, please.' },
      },
      {
        id: 'co6',
        tiles: ['きて', 'みても', 'いいですか'],
        translation: { es: '¿Me lo puedo probar?', en: 'Can I try it on?' },
      },
    ],
  },
  {
    // Sin `imageItems`, mismo criterio que "De compras".
    id: 'trabajo',
    title: { es: 'En el trabajo', en: 'At work' },
    icon: Briefcase,
    description: {
      es: 'Reuniones, pedidos, salir de la oficina.',
      en: 'Meetings, requests, leaving the office.',
    },
    phrases: [
      {
        id: 'tr1',
        tiles: ['かいぎは', 'なんじから', 'ですか'],
        translation: { es: '¿A qué hora empieza la reunión?', en: 'What time does the meeting start?' },
      },
      {
        id: 'tr2',
        tiles: ['これを', 'コピーして', 'ください'],
        translation: { es: 'Fotocopie esto, por favor.', en: 'Photocopy this, please.' },
      },
      {
        id: 'tr3',
        tiles: ['しごとが', 'おわりました'],
        translation: { es: 'Terminé el trabajo.', en: 'I finished the work.' },
      },
      {
        id: 'tr4',
        tiles: ['きょうは', 'やすみを', 'とります'],
        translation: { es: 'Hoy tomo el día libre.', en: "I'm taking the day off today." },
      },
      {
        id: 'tr5',
        tiles: ['メールを', 'おくって', 'ください'],
        translation: { es: 'Mande un mail, por favor.', en: 'Send an email, please.' },
      },
      {
        id: 'tr6',
        tiles: ['おさきに', 'しつれいします'],
        translation: { es: 'Me retiro primero.', en: "I'm leaving first." },
      },
    ],
  },
];

export function getSceneTheme(id: string): SceneTheme | undefined {
  return SCENE_THEMES.find((t) => t.id === id);
}
