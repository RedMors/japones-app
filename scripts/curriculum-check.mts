/**
 * Prueba la lógica del curriculum contra una COPIA temporal de data/app.db,
 * nunca la real — evita repetir el incidente de esta sesión donde un test
 * dejó basura real en el progreso del usuario (sesión huérfana, palabra
 * marcada "descartada para siempre" sin que el usuario lo pidiera).
 * Correr: npm run check:curriculum
 */
import fs from 'node:fs';
import path from 'node:path';

const REAL_DB = path.join(process.cwd(), 'data', 'app.db');
const TEST_DB = path.join(process.cwd(), 'data', '.test-app.db');

for (const p of [TEST_DB, `${TEST_DB}-wal`, `${TEST_DB}-shm`]) {
  if (fs.existsSync(p)) fs.rmSync(p);
}
fs.copyFileSync(REAL_DB, TEST_DB);
process.env.APP_DB_PATH = TEST_DB;

// Import dinámico: tiene que pasar DESPUÉS de fijar APP_DB_PATH. Un import
// estático se evalúa antes que cualquier código de este archivo, así que
// lib/db.ts leería la ruta real antes de que la pisemos.
const { getDb } = await import('../lib/db.ts');
const { HIRAGANA, KATAKANA } = await import('../lib/curriculum/kana-data.ts');
const { UNITS, getUnit, getFirstUnit, getNextUnit } = await import('../lib/curriculum/units.ts');
const {
  getUnitStatus,
  getSessionItems,
  recordAnswer,
  isUnitComplete,
  checkAndUnlockNext,
  startSession,
  finishSession,
} = await import('../lib/curriculum/progress.ts');
const { buildMultipleChoice, buildSession } = await import('../lib/curriculum/exercises.ts');

let failed = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${label}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}
function ok(label: string, cond: boolean) {
  if (!cond) failed++;
  console.log(`${cond ? 'ok  ' : 'FALLA'} ${label}`);
}

const db = getDb();

// --- datos estáticos --------------------------------------------------------
eq('46 hiragana', HIRAGANA.length, 46);
eq('46 katakana', KATAKANA.length, 46);
ok('ids únicos entre hiragana y katakana', new Set([...HIRAGANA, ...KATAKANA].map((k) => k.id)).size === 92);
eq('ん hiragana -> ン katakana', KATAKANA.find((k) => k.romaji === 'n')?.char, 'ン');
eq('を hiragana -> ヲ katakana', KATAKANA.find((k) => k.romaji === 'wo')?.char, 'ヲ');

// --- unidades ---------------------------------------------------------------
eq('primera unidad es hiragana', getFirstUnit().id, 'hiragana-basico');
eq('siguiente de hiragana es katakana', getNextUnit('hiragana-basico')?.id, 'katakana-basico');
eq('sin siguiente después de la última', getNextUnit(UNITS[UNITS.length - 1].id), undefined);

// --- estado de desbloqueo ----------------------------------------------------
eq('primera unidad disponible sin progreso previo', getUnitStatus('hiragana-basico'), 'available');
eq('segunda unidad bloqueada sin progreso previo', getUnitStatus('katakana-basico'), 'locked');

// --- selección de ítems para sesión ------------------------------------------
const hiragana = getUnit('hiragana-basico')!;
const firstBatch = getSessionItems('hiragana-basico');
eq('primera sesión trae ítems nunca vistos, tope 10', firstBatch.length, 10);
ok('todos son de la unidad', firstBatch.every((i) => hiragana.items.some((h) => h.id === i.id)));

// --- opción múltiple ----------------------------------------------------------
const question = buildMultipleChoice(hiragana.items[0], hiragana.items);
eq('4 opciones', question.choices.length, 4);
ok('la respuesta correcta está entre las opciones', question.choices.includes(question.answer));
ok('sin opciones duplicadas', new Set(question.choices).size === question.choices.length);

const session = buildSession(firstBatch, hiragana.items);
eq('una pregunta por ítem de la sesión', session.length, firstBatch.length);

// --- repetición espaciada -----------------------------------------------------
const itemId = hiragana.items[0].id;

recordAnswer('hiragana-basico', itemId, true);
let row = db.prepare('SELECT * FROM curriculum_item_progress WHERE item_id = ?').get(itemId) as {
  correct_streak: number;
  interval_days: number;
  mastered: number;
};
eq('1er acierto: streak 1, intervalo 1 día', [row.correct_streak, row.interval_days], [1, 1]);
eq('no dominado con 1 acierto', row.mastered, 0);

for (let i = 0; i < 3; i++) recordAnswer('hiragana-basico', itemId, true);
row = db.prepare('SELECT * FROM curriculum_item_progress WHERE item_id = ?').get(itemId) as typeof row;
eq('4 aciertos seguidos: streak 4', row.correct_streak, 4);
eq('intervalo duplica hasta el tope', row.interval_days, 8);
eq('todavía no dominado (falta 1)', row.mastered, 0);

recordAnswer('hiragana-basico', itemId, true);
row = db.prepare('SELECT * FROM curriculum_item_progress WHERE item_id = ?').get(itemId) as typeof row;
eq('5 aciertos seguidos: dominado', row.mastered, 1);

recordAnswer('hiragana-basico', itemId, false);
row = db.prepare('SELECT * FROM curriculum_item_progress WHERE item_id = ?').get(itemId) as typeof row;
eq('un error resetea el streak', row.correct_streak, 0);
eq('un error quita dominado', row.mastered, 0);
eq('un error vuelve el intervalo a 0 (disponible ya)', row.interval_days, 0);

// un ítem ya visto (aunque no dominado) no debe volver a salir como "nunca visto"
const secondBatch = getSessionItems('hiragana-basico');
ok(
  'ítem con progreso no cuenta como "nunca visto" en la próxima selección',
  !secondBatch.some((i) => i.id === itemId) || hiragana.items.length <= 10,
);

// --- completar unidad y desbloquear la siguiente ------------------------------
ok('unidad no completa a mitad de camino', !isUnitComplete('hiragana-basico'));

for (const item of hiragana.items) {
  // 5 aciertos seguidos por ítem, directo, sin pasar por la selección de sesión.
  for (let i = 0; i < 5; i++) recordAnswer('hiragana-basico', item.id, true);
}
ok('unidad completa con todos los ítems dominados', isUnitComplete('hiragana-basico'));

checkAndUnlockNext('hiragana-basico');
eq('unidad completada queda marcada', getUnitStatus('hiragana-basico'), 'completed');
eq('siguiente unidad se desbloquea', getUnitStatus('katakana-basico'), 'available');

// no debe seguir vendiendo ítems para minar en una unidad ya completa
const afterComplete = getSessionItems('hiragana-basico');
eq('unidad completa no da más ítems para hoy', afterComplete.length, 0);

// --- sesiones -------------------------------------------------------------
const sessionId = startSession('katakana-basico');
ok('startSession devuelve un id', sessionId > 0);
finishSession(sessionId, 8, 10);
const sessionRow = db.prepare('SELECT * FROM curriculum_sessions WHERE id = ?').get(sessionId) as {
  correct_count: number;
  total_count: number;
  finished_at: string | null;
};
eq('sesión guarda aciertos', [sessionRow.correct_count, sessionRow.total_count], [8, 10]);
ok('sesión queda marcada como terminada', sessionRow.finished_at !== null);

// --- limpieza: se borra la copia temporal entera, no hace falta DELETE fila
// por fila — la base real nunca se tocó.
for (const p of [TEST_DB, `${TEST_DB}-wal`, `${TEST_DB}-shm`]) {
  if (fs.existsSync(p)) fs.rmSync(p);
}

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
