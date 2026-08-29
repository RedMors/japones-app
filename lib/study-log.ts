/**
 * Punto único por donde pasa toda actividad de estudio (mining, curriculum,
 * repasos de Anki). El sentence miner y el curriculum ya llaman a logStudy();
 * agregar una nueva actividad es un solo call site nuevo.
 */
import { getDb } from './db.ts';

export type StudyActivity = 'mining' | 'anki_review' | 'curriculum';

export type StudyLogEntry = {
  activity: StudyActivity;
  minutes?: number;
  notes?: string;
};

export function logStudy(entry: StudyLogEntry): void {
  getDb()
    .prepare(
      `INSERT INTO study_logs (activity, minutes, notes) VALUES (?, ?, ?)`,
    )
    .run(entry.activity, entry.minutes ?? null, entry.notes ?? null);
}

export type DayActivity = { date: string; count: number };

/** Días con al menos una actividad registrada, en los últimos N días. */
export function getActivityByDay(days: number): DayActivity[] {
  return getDb()
    .prepare(
      `SELECT date(created_at) AS date, COUNT(*) AS count
       FROM study_logs
       WHERE created_at >= datetime('now', ?)
       GROUP BY date(created_at)
       ORDER BY date`,
    )
    .all(`-${days} days`) as DayActivity[];
}

/** Racha de días consecutivos con actividad, terminando hoy o ayer. */
export function computeStudyStreak(byDay: DayActivity[]): number {
  const days = new Set(byDay.map((d) => d.date));
  const today = new Date();
  let streak = 0;
  const cursor = new Date(today);

  // El día en curso no rompe la racha si todavía no hay actividad hoy.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type ActivityTotals = Record<StudyActivity, number>;

export function getActivityTotals(): ActivityTotals {
  const rows = getDb()
    .prepare(`SELECT activity, COUNT(*) AS count FROM study_logs GROUP BY activity`)
    .all() as { activity: StudyActivity; count: number }[];

  const totals: ActivityTotals = { mining: 0, anki_review: 0, curriculum: 0 };
  for (const row of rows) totals[row.activity] = row.count;
  return totals;
}
