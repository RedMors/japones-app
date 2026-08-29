import { hiraganaToRomaji } from '../lib/romaji.ts';

let failed = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${label}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}

eq('básico', hiraganaToRomaji('たべる'), 'taberu');
eq('con dakuten', hiraganaToRomaji('がっこう'), 'gakkou');
eq('yōon', hiraganaToRomaji('きょう'), 'kyou');
eq('sokuon simple', hiraganaToRomaji('けっこん'), 'kekkon');
eq('n final', hiraganaToRomaji('ほん'), 'hon');
eq('alargamiento katakana-style', hiraganaToRomaji('らーめん'), 'raamen');
eq('しゃ', hiraganaToRomaji('しゃしん'), 'shashin');
eq('じゃ', hiraganaToRomaji('じゃま'), 'jama');

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
