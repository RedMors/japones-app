/**
 * Punto único por donde pasa toda actividad de estudio. Hoy es un no-op.
 *
 * En Fase 2 esto escribe en la tabla `study_logs`. El objetivo es que cuando
 * llegue ese momento, agregar el cuerpo acá sea el único cambio necesario —
 * el sentence miner y el resto de Fase 1 ya llaman a esta función y no
 * necesitan tocarse.
 */
export type StudyActivity = 'mining' | 'anki_review' | 'curriculum';

export type StudyLogEntry = {
  activity: StudyActivity;
  minutes?: number;
  notes?: string;
};

export function logStudy(_entry: StudyLogEntry): void {
  // Fase 2: INSERT INTO study_logs (...)
}
