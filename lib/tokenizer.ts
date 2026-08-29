import kuromoji, { type IpadicFeatures, type Tokenizer } from 'kuromoji';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {
  containsJapanese,
  isKanaOnly,
  katakanaToHiragana,
  normalizeLemma,
} from './normalize.ts';

export type WordCandidate = {
  /** Forma canónica, la clave con la que se compara contra el vocabulario conocido. */
  lemma: string;
  /** Cómo apareció en la línea (食べた, no 食べる). */
  surface: string;
  /** Lectura en hiragana, o null si kuromoji no la conoce. */
  reading: string | null;
  /** "名詞-一般", "動詞-自立"… útil para depurar y para filtrar en la UI. */
  pos: string;
  /** kuromoji no tenía esta palabra en su diccionario: probable nombre propio o slang. */
  isUnknown: boolean;
};

export type TokenizeOptions = {
  /** Los subtítulos de anime están llenos de nombres de personajes. Por defecto fuera. */
  includeProperNouns?: boolean;
};

/** Clases de palabra que pueden ser vocabulario que valga la pena aprender. */
const CONTENT_POS = new Set(['名詞', '動詞', '形容詞', '副詞']);

/**
 * Subcategorías que son gramática, no vocabulario. Sin este filtro el 80% de
 * las "palabras nuevas" son partículas, auxiliares y sufijos: ruido que arruina
 * la pantalla de resultados.
 */
const REJECTED_DETAIL = new Set([
  '非自立', // こと, もの, ため; la いる de ている
  '接尾', // 〜的, 〜さん, 〜目
  '代名詞', // これ, それ, あれ
  '数', // 一, 二, 100
  '特殊', // そう
  '接続詞的',
  '動詞非自立的',
  'ナイ形容詞語幹',
]);

// --- carga del tokenizer --------------------------------------------------

function resolveDicPath(): string {
  if (process.env.KUROMOJI_DIC_PATH) return process.env.KUROMOJI_DIC_PATH;

  // createRequire desde package.json (no desde import.meta) para que funcione
  // igual en ESM y en el bundle de servidor de Next.
  try {
    const req = createRequire(path.join(process.cwd(), 'package.json'));
    const pkg = req.resolve('kuromoji/package.json');
    const dir = path.join(path.dirname(pkg), 'dict');
    if (fs.existsSync(dir)) return dir;
  } catch {
    // cae al camino de abajo
  }

  const fallback = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict');
  if (fs.existsSync(fallback)) return fallback;

  throw new Error(
    'No encontré el diccionario de kuromoji. Corré `npm install`, ' +
      'o apuntá KUROMOJI_DIC_PATH a la carpeta dict/.',
  );
}

const globalForTokenizer = globalThis as unknown as {
  __kuromoji?: Promise<Tokenizer<IpadicFeatures>>;
  __lemmaReadings?: Map<string, string | null>;
};

/**
 * Construir el tokenizer lee ~17 MB de diccionario y tarda 1-2s. Se hace una
 * sola vez por proceso; la promesa se cachea para que N pedidos concurrentes
 * no disparen N construcciones.
 */
export function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (!globalForTokenizer.__kuromoji) {
    const dicPath = resolveDicPath();
    globalForTokenizer.__kuromoji = new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath }).build((err, tokenizer) => {
        if (err) {
          // Si falla, se limpia la caché para poder reintentar en el próximo pedido.
          globalForTokenizer.__kuromoji = undefined;
          reject(err);
          return;
        }
        resolve(tokenizer);
      });
    });
  }
  return globalForTokenizer.__kuromoji;
}

/** Precarga en background para que el primer .srt no espere los 1-2s. */
export function warmTokenizer(): void {
  void getTokenizer().catch(() => {});
}

// --- tokenización ---------------------------------------------------------

export async function tokenizeRaw(text: string): Promise<IpadicFeatures[]> {
  if (!text.trim()) return [];
  const tokenizer = await getTokenizer();
  return tokenizer.tokenize(text);
}

/**
 * kuromoji devuelve la lectura de la forma que apareció en el texto, no la del
 * lema: 死んで da しん, 食べた da たべ. Para una tarjeta hace falta la lectura de
 * la forma de diccionario, así que se re-tokeniza el lema y se cachea.
 */
function readingOfLemma(
  tokenizer: Tokenizer<IpadicFeatures>,
  lemma: string,
): string | null {
  const cache = (globalForTokenizer.__lemmaReadings ??= new Map());
  const hit = cache.get(lemma);
  if (hit !== undefined) return hit;

  let reading: string | null = null;
  try {
    const parts = tokenizer.tokenize(lemma);
    const joined = parts
      .map((p) => (p.reading && p.reading !== '*' ? p.reading : ''))
      .join('');
    // Si a alguna parte le faltó la lectura, la reconstrucción es incompleta.
    const complete = parts.every((p) => p.reading && p.reading !== '*');
    reading = complete && joined ? katakanaToHiragana(joined) : null;
  } catch {
    reading = null;
  }

  cache.set(lemma, reading);
  return reading;
}

function posLabel(token: IpadicFeatures): string {
  return token.pos_detail_1 && token.pos_detail_1 !== '*'
    ? `${token.pos}-${token.pos_detail_1}`
    : token.pos;
}

function isContentWord(token: IpadicFeatures, options: TokenizeOptions): boolean {
  if (!CONTENT_POS.has(token.pos)) return false;
  if (REJECTED_DETAIL.has(token.pos_detail_1)) return false;
  if (REJECTED_DETAIL.has(token.pos_detail_2)) return false;

  if (token.pos_detail_1 === '固有名詞' && !options.includeProperNouns) return false;

  // 動詞,接尾 y auxiliares que kuromoji marca como 動詞 pero son gramática.
  if (token.pos === '動詞' && token.pos_detail_1 === '接尾') return false;

  return true;
}

/**
 * Línea de subtítulo -> candidatos a vocabulario, deduplicados y en orden de
 * aparición. No sabe nada de lo que ya conocés: ese filtro es del miner.
 */
export async function extractWords(
  text: string,
  options: TokenizeOptions = {},
): Promise<WordCandidate[]> {
  const tokenizer = await getTokenizer();
  const tokens = await tokenizeRaw(text);
  const out: WordCandidate[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!isContentWord(token, options)) continue;

    // 勉強 + する = un solo concepto. El する que sigue a un sustantivo サ変接続
    // es gramática; emitir 勉強 sola es lo que además busca el diccionario.
    if (
      token.pos === '動詞' &&
      (token.basic_form === 'する' || token.surface_form === 'し') &&
      tokens[i - 1]?.pos_detail_1 === 'サ変接続'
    ) {
      continue;
    }

    const base =
      token.basic_form && token.basic_form !== '*' ? token.basic_form : token.surface_form;
    const lemma = normalizeLemma(base);

    if (!lemma || !containsJapanese(lemma)) continue;
    // Un solo hiragana suelto casi nunca es vocabulario útil.
    if (lemma.length === 1 && /^[ぁ-ゟ]$/.test(lemma)) continue;
    if (seen.has(lemma)) continue;
    seen.add(lemma);

    // Si la palabra no venía conjugada, la lectura del token ya sirve.
    let reading =
      token.surface_form === base && token.reading && token.reading !== '*'
        ? katakanaToHiragana(token.reading)
        : readingOfLemma(tokenizer, base);

    // Palabra en puro kana que kuromoji no conoce (ラーメン, nombres): su
    // lectura es ella misma, no hace falta marcarla como desconocida.
    if (!reading && isKanaOnly(lemma)) reading = katakanaToHiragana(lemma);

    out.push({
      lemma,
      surface: token.surface_form,
      reading,
      pos: posLabel(token),
      isUnknown: token.word_type === 'UNKNOWN',
    });
  }

  return out;
}

const HAS_KANJI_RE = /[一-鿿㐀-䶿々]/;
const LEADING_KANA_RE = /^[ぁ-ゟー]+/;
const TRAILING_KANA_RE = /[ぁ-ゟー]+$/;

/**
 * Anota un token con furigana solo sobre su parte kanji, dejando afuera de
 * los corchetes tanto el okurigana (terminación en hiragana de verbos/
 * adjetivos: 食べる -> 食[た]べる) como el prefijo honorífico お/ご
 * (お願いします -> お願[ねが]いします, no お願[おねが]いします — sin
 * despegar el prefijo, la lectura completa おねが quedaba puesta sobre 願
 * mientras la お de al lado se mostraba de nuevo como texto plano, duplicada
 * visualmente). Misma convención que el contenido de gramática/vocabulario
 * escrito a mano (ver grammar-data.ts), donde el furigana solo cubre el kanji.
 */
function annotateToken(surface: string, readingHiragana: string): string {
  if (!HAS_KANJI_RE.test(surface)) return surface;
  if (readingHiragana === surface) return surface;

  const leadingMatch = surface.match(LEADING_KANA_RE);
  const leading = leadingMatch ? leadingMatch[0] : '';
  // Si el prefijo no calza con el arranque de la lectura, es un caso raro
  // donde no se puede separar con confianza: se anota la palabra entera.
  if (leading && !readingHiragana.startsWith(leading)) {
    return `${surface}[${readingHiragana}]`;
  }
  const afterLeading = surface.slice(leading.length);
  const readingAfterLeading = leading ? readingHiragana.slice(leading.length) : readingHiragana;

  const trailingMatch = afterLeading.match(TRAILING_KANA_RE);
  const trailing = trailingMatch ? trailingMatch[0] : '';
  const kanjiPart = trailing ? afterLeading.slice(0, -trailing.length) : afterLeading;

  if (!kanjiPart) return `${surface}[${readingHiragana}]`;

  if (trailing && readingAfterLeading.endsWith(trailing)) {
    const readingPart = readingAfterLeading.slice(0, -trailing.length);
    return `${leading}${kanjiPart}[${readingPart}]${trailing}`;
  }

  // Okurigana no calza con la lectura (irregular) o no hay okurigana: se
  // anota el resto entero (con prefijo ya separado), sigue siendo válido
  // para parseFurigana.
  return `${leading}${kanjiPart}[${readingAfterLeading}]`;
}

/**
 * Anota una oración completa con furigana por token: "店長は毎日ラーメンを
 * 食べる" -> "店長[てんちょう]は毎日[まいにち]ラーメンを食[た]べる",
 * formato que entiende `parseFurigana`. A diferencia de `extractWords`, acá
 * se anota TODO lo que tiene kanji, no solo el vocabulario nuevo — sirve para
 * mostrar la oración entera legible, no para minar.
 */
export async function annotateFurigana(text: string): Promise<string> {
  if (!text.trim() || !HAS_KANJI_RE.test(text)) return text;

  const tokens = await tokenizeRaw(text);
  return tokens
    .map((token) => {
      const surface = token.surface_form;
      if (!HAS_KANJI_RE.test(surface)) return surface;
      const reading =
        token.reading && token.reading !== '*' ? katakanaToHiragana(token.reading) : null;
      if (!reading) return surface;
      return annotateToken(surface, reading);
    })
    .join('');
}

/**
 * Varias líneas de una vez. Devuelve los candidatos por línea, conservando el
 * índice original para poder mapear cada palabra a su oración y timestamp.
 */
export async function extractWordsByLine(
  lines: string[],
  options: TokenizeOptions = {},
): Promise<WordCandidate[][]> {
  await getTokenizer(); // se construye una vez, no una por línea
  const result: WordCandidate[][] = [];
  for (const line of lines) {
    result.push(await extractWords(line, options));
  }
  return result;
}
