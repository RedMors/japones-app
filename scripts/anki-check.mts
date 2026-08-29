/**
 * Prueba el cliente de Anki. La lógica pura se verifica siempre; las llamadas
 * reales solo si Anki está abierto. Correr: npm run check:anki
 */
import {
  getStatus,
  computeStreak,
  sanitizeTag,
  escapeQuery,
  pickVocabField,
  buildTags,
  getDeckStats,
  getReviewsByDay,
  getDeckNames,
  type DayReviews,
} from '../lib/anki-connect.ts';

let failed = 0;

function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${label}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}

/** días[0] = hoy, días[1] = ayer, … */
function daily(...counts: number[]): DayReviews[] {
  return counts.map((reviews, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return { date: d.toISOString().slice(0, 10), reviews };
  });
}

console.log('--- lógica pura ---');
eq('racha de 3', computeStreak(daily(5, 3, 8, 0, 2)), 3);
eq('hoy sin repasar no penaliza', computeStreak(daily(0, 3, 8, 0)), 2);
eq('racha cortada', computeStreak(daily(0, 0, 8, 8)), 0);
eq('sin datos', computeStreak([]), 0);
eq('racha larga', computeStreak(daily(1, 1, 1, 1, 1)), 5);

eq('tag con espacios', sanitizeTag('Attack on Titan'), 'Attack_on_Titan');
eq('tag con comillas', sanitizeTag('Re:"Zero"'), 'Re:Zero');
eq('escape de query', escapeQuery('Mi "mazo"\\x'), 'Mi \\"mazo\\"\\\\x');

eq('campo por pista', pickVocabField(['Front', 'Back', 'Word']), 'Word');
eq('campo por pista japonesa', pickVocabField(['意味', '単語']), '単語');
eq('campo sin pista: el primero', pickVocabField(['Foo', 'Bar']), 'Foo');
eq('sin campos', pickVocabField([]), null);

eq(
  'tags de tarjeta',
  buildTags({ word: '食べる', animeName: 'Attack on Titan', episodeLabel: 'E03' }),
  ['sentence-mining', 'anime::Attack_on_Titan', 'anime::Attack_on_Titan::E03'],
);
eq('tags sin episodio', buildTags({ word: 'x', animeName: 'Naruto' }), [
  'sentence-mining',
  'anime::Naruto',
]);

console.log('\n--- conexión ---');
const started = Date.now();
const status = await getStatus();
const elapsed = Date.now() - started;

if (status.connected) {
  console.log(`ok   conectado, AnkiConnect v${status.version} (${elapsed}ms)`);

  const decks = await getDeckNames();
  console.log(`     mazos: ${decks.length}`);

  const stats = await getDeckStats();
  for (const s of stats.slice(0, 8)) {
    console.log(`     ${s.deckName}: ${s.total} tarjetas, ${s.mature} dominadas`);
  }

  const days = await getReviewsByDay(30);
  const total = days.reduce((sum, d) => sum + d.reviews, 0);
  console.log(`     últimos 30 días: ${total} repasos, racha ${computeStreak(days)}`);
} else {
  console.log(`ok   Anki cerrado, detectado en ${elapsed}ms`);
  console.log(`     mensaje: ${status.message}`);
  if (elapsed > 4000) {
    failed++;
    console.log('FALLA tardó demasiado en detectar que Anki no está');
  }
}

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
