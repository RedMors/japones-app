/**
 * Sin dependencias de servidor a propósito: se importa desde goal-form.tsx
 * (client component). Si esto alguna vez importa algo que toque
 * better-sqlite3 (vía db.ts), el bundle de cliente se rompe en Turbopack.
 */
export const JLPT_GOAL_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type JlptGoalLevel = (typeof JLPT_GOAL_LEVELS)[number];
