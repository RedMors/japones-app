/**
 * Prueba el tokenizer con líneas tipo subtítulo. Correr: npm run check:tokenizer
 */
import { extractWords, tokenizeRaw, getTokenizer } from '../lib/tokenizer.ts';
import { katakanaToHiragana, isKanaOnly } from '../lib/normalize.ts';

const LINES = [
  'お前はもう死んでいる。',
  '今日は学校で日本語を勉強しました。',
  '猫が三匹、屋根の上に座っている。',
  'ナルトくん、それは本当に危ないことだよ。',
  'すごい！このラーメンはとても美味しいですね。',
];

const started = Date.now();
await getTokenizer();
console.log(`tokenizer cargado en ${Date.now() - started}ms\n`);

for (const line of LINES) {
  const words = await extractWords(line);
  console.log(line);
  console.log(
    '  ' +
      (words.length
        ? words.map((w) => `${w.lemma}(${w.reading ?? '?'}) ${w.pos}`).join('  ·  ')
        : '— sin candidatos —'),
  );
  console.log();
}

// El filtro de POS tiene que estar sacando gramática de verdad
const raw = await tokenizeRaw('今日は学校で日本語を勉強しました。');
const kept = await extractWords('今日は学校で日本語を勉強しました。');
console.log(`filtro POS: ${raw.length} tokens crudos -> ${kept.length} candidatos`);

// Nombres propios fuera por defecto, dentro si se piden
const sinNombres = await extractWords('田中さんが走る。');
const conNombres = await extractWords('田中さんが走る。', { includeProperNouns: true });
console.log(
  `nombres propios: sin=[${sinNombres.map((w) => w.lemma)}] con=[${conNombres.map((w) => w.lemma)}]`,
);

// La lectura debe salir en hiragana, no katakana
const tabe = (await extractWords('ご飯を食べた。')).find((w) => w.lemma === '食べる');
console.log(`lema desde conjugación: 食べた -> ${tabe?.lemma} / ${tabe?.reading}`);

console.log(`kana: ${katakanaToHiragana('タベル')} | isKanaOnly('たべる')=${isKanaOnly('たべる')}`);

// Segunda llamada debe reusar el tokenizer cacheado
const t2 = Date.now();
await getTokenizer();
console.log(`segunda carga: ${Date.now() - t2}ms (cacheado)`);
