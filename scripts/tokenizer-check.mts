/**
 * Prueba el tokenizer con líneas tipo subtítulo. Correr: npm run check:tokenizer
 */
import { extractWords, tokenizeRaw, getTokenizer, annotateFurigana } from '../lib/tokenizer.ts';
import { katakanaToHiragana, isKanaOnly } from '../lib/normalize.ts';

let failed = 0;
function eq(label: string, got: unknown, want: unknown) {
  const pass = JSON.stringify(got) === JSON.stringify(want);
  if (!pass) failed++;
  console.log(`${pass ? 'ok  ' : 'FALLA'} ${label}`);
  if (!pass) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}

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

// annotateFurigana: furigana solo sobre el kanji, no sobre la palabra entera
// con okurigana adentro de los corchetes (misma convención que grammar-data.ts,
// ver docstring de annotateToken en lib/tokenizer.ts).
console.log();
eq(
  'furigana deja el okurigana afuera de los corchetes',
  await annotateFurigana('店長は毎日ラーメンを食べる'),
  '店長[てんちょう]は毎日[まいにち]ラーメンを食[た]べる',
);
eq(
  'furigana en verbo conjugado (irregular con ん)',
  await annotateFurigana('猫が窓から飛んだ'),
  '猫[ねこ]が窓[まど]から飛[と]んだ',
);
eq('sin kanji: no toca el texto', await annotateFurigana('これはペンです'), 'これはペンです');
eq('texto vacío: no explota', await annotateFurigana(''), '');
eq(
  'prefijo honorífico お/ご no se pega a la ruby del kanji',
  await annotateFurigana('お願いします'),
  'お願[ねが]いします',
);

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
