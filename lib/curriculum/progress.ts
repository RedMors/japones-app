/**
 * Progreso del curriculum: qué ítems domina el usuario, qué unidades están
 * desbloqueadas, y el registro de sesiones para el resumen al terminar.
 *
 * Repetición espaciada tipo Leitner simplificado: cada acierto duplica el
 * intervalo hasta el tope de 16 días; un error lo resetea a "disponible ya".
 * No es SM-2, pero evita la mentira de "dominado para siempre" con 3 aciertos
 * seguidos en un minuto.
 */
import { getDb, getSetting, setSetting } from '../db.ts';
import { getUnit, getNextUnit, UNITS, type Unit } from './units.ts';
import { JLPT_GOAL_LEVELS, type JlptGoalLevel } from './goal-levels.ts';
import { stripFurigana, toReading } from './furigana.ts';

export { JLPT_GOAL_LEVELS, type JlptGoalLevel };

const MASTER_STREAK = 5;
const MAX_INTERVAL_DAYS = 16;
const ITEMS_PER_SESSION = 10;

function intervalForStreak(streak: number): number {
  if (streak <= 0) return 0;
  return Math.min(2 ** (streak - 1), MAX_INTERVAL_DAYS);
}

type ItemProgressRow = {
  item_id: string;
  unit_id: string;
  correct_streak: number;
  seen_count: number;
  interval_days: number;
  next_review_at: string;
  mastered: number;
  last_seen_at: string | null;
};

export type UnitStatus = 'locked' | 'available' | 'completed';

export function getUnitStatus(unitId: string): UnitStatus {
  const row = getDb()
    .prepare('SELECT status FROM curriculum_unit_progress WHERE unit_id = ?')
    .get(unitId) as { status: UnitStatus } | undefined;
  if (row) return row.status;
  // Sin registro todavía: la primera unidad arranca disponible, el resto bloqueada.
  return UNITS[0]?.id === unitId ? 'available' : 'locked';
}

/**
 * Todas las unidades con su estado y progreso, en 2 queries en total en vez
 * de 2 por unidad — con 400+ unidades esa diferencia es real.
 */
export function listUnitsWithStatus(): (Unit & {
  status: UnitStatus;
  masteredCount: number;
  seenCount: number;
})[] {
  const db = getDb();

  const statusRows = db
    .prepare('SELECT unit_id, status FROM curriculum_unit_progress')
    .all() as { unit_id: string; status: UnitStatus }[];
  const statusByUnit = new Map(statusRows.map((r) => [r.unit_id, r.status]));

  const masteredRows = db
    .prepare(
      'SELECT unit_id, count(*) c FROM curriculum_item_progress WHERE mastered = 1 GROUP BY unit_id',
    )
    .all() as { unit_id: string; c: number }[];
  const masteredByUnit = new Map(masteredRows.map((r) => [r.unit_id, r.c]));

  // Cuántos ítems ya se contestaron al menos una vez, dominados o no — sin
  // esto el contador de progreso se queda en 0 hasta el primer dominado (5
  // aciertos espaciados en el tiempo) y da la sensación falsa de que nada
  // avanzó, aunque el usuario ya haya hecho varias sesiones.
  const seenRows = db
    .prepare('SELECT unit_id, count(*) c FROM curriculum_item_progress GROUP BY unit_id')
    .all() as { unit_id: string; c: number }[];
  const seenByUnit = new Map(seenRows.map((r) => [r.unit_id, r.c]));

  return UNITS.map((unit) => ({
    ...unit,
    status: statusByUnit.get(unit.id) ?? (UNITS[0]?.id === unit.id ? 'available' : 'locked'),
    masteredCount: masteredByUnit.get(unit.id) ?? 0,
    seenCount: seenByUnit.get(unit.id) ?? 0,
  }));
}

function getItemProgress(itemId: string): ItemProgressRow | undefined {
  return getDb()
    .prepare('SELECT * FROM curriculum_item_progress WHERE item_id = ?')
    .get(itemId) as ItemProgressRow | undefined;
}

/**
 * Ítems para la próxima sesión: primero los nunca vistos (para ir avanzando
 * contenido nuevo), después los que ya vencieron su repaso. Nunca mezcla
 * ítems que todavía no vencieron — eso sería repasar sin necesidad.
 */
export function getSessionItems(
  unitId: string,
): { id: string; prompt: string; answer: string; group: string; retry: boolean }[] {
  const unit = getUnit(unitId);
  if (!unit) return [];

  const db = getDb();
  const seen = new Set(
    (
      db
        .prepare('SELECT item_id FROM curriculum_item_progress WHERE unit_id = ?')
        .all(unitId) as { item_id: string }[]
    ).map((r) => r.item_id),
  );

  const neverSeen = unit.items.filter((i) => !seen.has(i.id));
  if (neverSeen.length > 0) {
    return neverSeen.slice(0, ITEMS_PER_SESSION).map((i) => ({ ...i, retry: false }));
  }

  // correct_streak = 0 en un ítem ya visto significa que la última vez que
  // se contestó fue un error (ver recordAnswer) — esos se sirven como
  // fill-blank (buildSession) para confirmar que de verdad se entendió, no
  // solo que se reconoció entre 4 opciones.
  const dueRows = db
    .prepare(
      `SELECT item_id, correct_streak FROM curriculum_item_progress
       WHERE unit_id = ? AND mastered = 0 AND next_review_at <= datetime('now')`,
    )
    .all(unitId) as { item_id: string; correct_streak: number }[];
  const dueStreakById = new Map(dueRows.map((r) => [r.item_id, r.correct_streak]));

  return unit.items
    .filter((i) => dueStreakById.has(i.id))
    .slice(0, ITEMS_PER_SESSION)
    .map((i) => ({ ...i, retry: dueStreakById.get(i.id) === 0 }));
}

export function recordAnswer(unitId: string, itemId: string, correct: boolean): void {
  const existing = getItemProgress(itemId);
  const prevStreak = existing?.correct_streak ?? 0;
  const streak = correct ? prevStreak + 1 : 0;
  const intervalDays = intervalForStreak(streak);
  const mastered = streak >= MASTER_STREAK ? 1 : 0;

  getDb()
    .prepare(
      `INSERT INTO curriculum_item_progress
         (item_id, unit_id, correct_streak, seen_count, interval_days, next_review_at, mastered, last_seen_at)
       VALUES (@itemId, @unitId, @streak, 1, @intervalDays,
               datetime('now', @intervalOffset), @mastered, datetime('now'))
       ON CONFLICT(item_id) DO UPDATE SET
         correct_streak = @streak,
         seen_count = seen_count + 1,
         interval_days = @intervalDays,
         next_review_at = datetime('now', @intervalOffset),
         mastered = @mastered,
         last_seen_at = datetime('now')`,
    )
    .run({
      itemId,
      unitId,
      streak,
      intervalDays,
      intervalOffset: `+${intervalDays} days`,
      mastered,
    });
}

export function isUnitComplete(unitId: string): boolean {
  const unit = getUnit(unitId);
  if (!unit || unit.items.length === 0) return false;

  const masteredCount = (
    getDb()
      .prepare(
        'SELECT count(*) c FROM curriculum_item_progress WHERE unit_id = ? AND mastered = 1',
      )
      .get(unitId) as { c: number }
  ).c;

  return masteredCount >= unit.items.length;
}

/** Marca la unidad completa y desbloquea la siguiente, si corresponde. */
export function checkAndUnlockNext(unitId: string): void {
  if (!isUnitComplete(unitId)) return;

  const db = getDb();
  db.prepare(
    `INSERT INTO curriculum_unit_progress (unit_id, status, completed_at)
     VALUES (?, 'completed', datetime('now'))
     ON CONFLICT(unit_id) DO UPDATE SET status = 'completed', completed_at = datetime('now')`,
  ).run(unitId);

  const next = getNextUnit(unitId);
  if (!next) return;

  db.prepare(
    `INSERT INTO curriculum_unit_progress (unit_id, status) VALUES (?, 'available')
     ON CONFLICT(unit_id) DO NOTHING`,
  ).run(next.id);
}

const LEVEL_ORDER: Unit['level'][] = ['hiragana', 'katakana', 'N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Progreso acumulado hacia una meta JLPT: todo lo que hay que dominar desde
 * el principio del curriculum hasta ese nivel incluido (el curriculum es
 * secuencial, no tiene sentido medir el nivel meta aislado del resto).
 */
export function getGoalProgress(goalLevel: JlptGoalLevel): { mastered: number; total: number } {
  const goalIndex = LEVEL_ORDER.indexOf(goalLevel);
  const relevantUnits = UNITS.filter((u) => LEVEL_ORDER.indexOf(u.level) <= goalIndex);
  const unitIds = relevantUnits.map((u) => u.id);
  const total = relevantUnits.reduce((sum, u) => sum + u.items.length, 0);
  if (unitIds.length === 0 || total === 0) return { mastered: 0, total: 0 };

  const placeholders = unitIds.map(() => '?').join(',');
  const mastered = (
    getDb()
      .prepare(
        `SELECT count(*) c FROM curriculum_item_progress
         WHERE mastered = 1 AND unit_id IN (${placeholders})`,
      )
      .get(...unitIds) as { c: number }
  ).c;

  return { mastered, total };
}

export type JlptGoal = { level: JlptGoalLevel; targetDate: string | null };

export function getGoal(): JlptGoal | null {
  const level = getSetting('jlpt_goal_level');
  if (!level || !(JLPT_GOAL_LEVELS as readonly string[]).includes(level)) return null;
  return { level: level as JlptGoalLevel, targetDate: getSetting('jlpt_goal_date') || null };
}

export function setGoal(level: JlptGoalLevel, targetDate: string | null): void {
  setSetting('jlpt_goal_level', level);
  setSetting('jlpt_goal_date', targetDate ?? '');
}

export type KanaCharStatus = 'mastered' | 'seen' | 'new';

/**
 * Progreso de TODOS los kana en una sola query, para la vista de referencia
 * /caracteres — a diferencia de las lecciones (10 por vez, secuenciales),
 * acá se ve de un vistazo qué caracteres ya se dominaron.
 */
export function getKanaProgressMap(): Map<string, KanaCharStatus> {
  const rows = getDb()
    .prepare(`SELECT item_id, mastered FROM curriculum_item_progress WHERE item_id LIKE 'kana:%'`)
    .all() as { item_id: string; mastered: number }[];

  const map = new Map<string, KanaCharStatus>();
  for (const row of rows) map.set(row.item_id, row.mastered ? 'mastered' : 'seen');
  return map;
}

export type SpeakingItem = { itemId: string; word: string; reading: string; meaning?: string };

/**
 * Vocabulario y kana ya dominados, listos para practicar pronunciación. Se
 * excluyen las unidades de gramática (oraciones para completar, no palabras
 * sueltas para pronunciar) — no dan un target de pronunciación limpio.
 */
export function getSpeakingPracticeItems(limit: number): SpeakingItem[] {
  const masteredRows = getDb()
    .prepare(
      `SELECT item_id FROM curriculum_item_progress WHERE mastered = 1 ORDER BY RANDOM() LIMIT ?`,
    )
    .all(limit * 3) as { item_id: string }[]; // de sobra: se descartan gramática/no encontrados

  const out: SpeakingItem[] = [];
  for (const row of masteredRows) {
    if (out.length >= limit) break;
    const unit = UNITS.find((u) => u.items.some((i) => i.id === row.item_id));
    if (!unit || unit.id.startsWith('grammar-')) continue;
    const item = unit.items.find((i) => i.id === row.item_id);
    if (!item) continue;

    const reading = toReading(item.prompt);
    if (!reading) continue;
    out.push({
      itemId: item.id,
      word: stripFurigana(item.prompt),
      reading,
      meaning: unit.level === 'hiragana' || unit.level === 'katakana' ? undefined : item.answer,
    });
  }
  return out;
}

export function startSession(unitId: string): number {
  const result = getDb()
    .prepare('INSERT INTO curriculum_sessions (unit_id) VALUES (?)')
    .run(unitId);
  return Number(result.lastInsertRowid);
}

export function finishSession(sessionId: number, correctCount: number, totalCount: number): void {
  getDb()
    .prepare(
      `UPDATE curriculum_sessions
       SET finished_at = datetime('now'), correct_count = ?, total_count = ?
       WHERE id = ?`,
    )
    .run(correctCount, totalCount, sessionId);
}
