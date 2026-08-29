import { parseFurigana, stripFurigana, withFurigana } from '../lib/curriculum/furigana.ts';

let failed = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${label}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}

eq('sin furigana', parseFurigana('ここで＿＿＿はいけません。'), [
  { text: 'ここで＿＿＿はいけません。' },
]);

eq('un segmento con furigana', parseFurigana('猫[ねこ]がいます。'), [
  { text: '猫', reading: 'ねこ' },
  { text: 'がいます。' },
]);

eq('varios segmentos', parseFurigana('私[わたし]は学生[がくせい]です。'), [
  { text: '私', reading: 'わたし' },
  { text: 'は' },
  { text: '学生', reading: 'がくせい' },
  { text: 'です。' },
]);

eq('con blanco en el medio', parseFurigana('私[わたし]＿＿＿学生[がくせい]です。'), [
  { text: '私', reading: 'わたし' },
  { text: '＿＿＿' },
  { text: '学生', reading: 'がくせい' },
  { text: 'です。' },
]);

eq('largo sin corchetes', stripFurigana('私[わたし]は学生[がくせい]です。'), '私は学生です。');
eq('largo sin cambios si no hay furigana', stripFurigana('ここで＿＿＿はいけません。'), 'ここで＿＿＿はいけません。');

eq('withFurigana agrega corchetes', withFurigana('食べる', 'たべる'), '食べる[たべる]');
eq('withFurigana sin lectura', withFurigana('ラーメン', null), 'ラーメン');
eq('withFurigana igual a la palabra (kana puro)', withFurigana('ねこ', 'ねこ'), 'ねこ');

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
