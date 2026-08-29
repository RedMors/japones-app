/**
 * Detecta kanji sin furigana en el contenido de gramática — no confiar en
 * revisión manual para 41 oraciones. Correr: npm run check:furigana-coverage
 */
import { UNITS } from '../lib/curriculum/units.ts';
import { parseFurigana } from '../lib/curriculum/furigana.ts';

const KANJI_RE = /[一-鿿㐀-䶿]/;

let problems = 0;

for (const unit of UNITS) {
  if (!unit.id.startsWith('grammar:') && !unit.id.startsWith('grammar-')) continue;
  for (const item of unit.items) {
    const segments = parseFurigana(item.prompt);
    for (const seg of segments) {
      if (!seg.reading && KANJI_RE.test(seg.text)) {
        problems++;
        console.log(`FALLA ${unit.id} / ${item.id}: kanji sin furigana en "${seg.text}"`);
        console.log(`      oración completa: ${item.prompt}`);
      }
    }
  }
}

// También el vocabulario JLPT, que usa withFurigana().
for (const unit of UNITS) {
  if (!unit.id.includes('-vocab-')) continue;
  for (const item of unit.items) {
    const segments = parseFurigana(item.prompt);
    for (const seg of segments) {
      if (!seg.reading && KANJI_RE.test(seg.text)) {
        problems++;
        console.log(`FALLA ${unit.id} / ${item.id}: kanji sin furigana en "${seg.text}" (prompt: ${item.prompt})`);
      }
    }
  }
}

console.log(
  problems === 0
    ? '\nTodo el kanji de gramática y vocabulario tiene furigana.'
    : `\n${problems} kanji sin furigana.`,
);
process.exit(problems === 0 ? 0 : 1);
