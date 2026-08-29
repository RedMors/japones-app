/**
 * Casos reales de campos de Anki. Correr: npm run check:normalize
 */
import {
  normalizeAnkiField,
  normalizeLemma,
  ankiFieldToLemmas,
  parseAnkiField,
  splitFurigana,
  containsJapanese,
} from '../lib/normalize.ts';

let failed = 0;

function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${label}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}

// HTML de Anki
eq('bold', normalizeAnkiField('<b>食べる</b>'), '食べる');
eq('div anidado', normalizeAnkiField('<div><span style="color:red">見る</span></div>'), '見る');
eq('entidades', normalizeAnkiField('R&amp;D&nbsp;test'), 'R&D test');
eq('entidad numérica', normalizeAnkiField('&#39;a&#x41;'), "'aA");

// furigana del addon Japanese Support
eq('furigana simple', splitFurigana('漢字[かんじ]'), { text: '漢字', reading: 'かんじ' });
eq('furigana en oración', splitFurigana('私[わたし]は 学生[がくせい]です'), {
  text: '私は学生です',
  reading: 'わたしはがくせいです',
});
eq('sin furigana', splitFurigana('食べる'), { text: '食べる', reading: null });

// ruby HTML: la lectura NO debe quedar pegada
eq('ruby', normalizeAnkiField('<ruby>漢字<rt>かんじ</rt></ruby>'), '漢字');

// markup propio de Anki
eq('sound tag', normalizeAnkiField('食べる[sound:abc.mp3]'), '食べる');
eq('cloze', normalizeAnkiField('{{c1::食べる::verbo}}'), '食べる');

// ancho completo -> NFKC
eq('ancho completo', normalizeLemma('ＡＢＣ１２３'), 'abc123');
eq('katakana medio', normalizeLemma('ｱﾆﾒ'), 'アニメ');

// lemas
eq('espacios en japonés', normalizeLemma('  食べ る  '), '食べる');
eq('puntuación final', normalizeLemma('食べる。'), '食べる');
eq('corchetes japoneses', normalizeLemma('「食べる」'), '食べる');
eq('latín', normalizeLemma('  To  Eat '), 'to eat');
eq('zero width', normalizeLemma('食​べる'), '食べる');

// campo con variantes
eq('variantes', ankiFieldToLemmas('見る、観る'), ['見る', '観る']);
eq('multilínea', ankiFieldToLemmas('<div>行く</div><div>行く</div>'), ['行く']);

// combinado: lo que realmente sale de una nota real
eq(
  'nota completa',
  parseAnkiField('<div><b>食[た]べる</b>&nbsp;[sound:x.mp3]</div>'),
  { text: '食べる', reading: 'たべる' },
);

eq('detecta japonés', containsJapanese('食べる'), true);
eq('detecta no japonés', containsJapanese('taberu'), false);

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
