'use server';

import {
  recordAnswer,
  checkAndUnlockNext,
  startSession,
  finishSession,
  isUnitComplete,
} from '@/lib/curriculum/progress';
import { logStudy } from '@/lib/study-log';

export async function beginSession(unitId: string): Promise<number> {
  return startSession(unitId);
}

export async function submitAnswer(
  unitId: string,
  itemId: string,
  correct: boolean,
): Promise<void> {
  recordAnswer(unitId, itemId, correct);
}

export async function endSession(
  sessionId: number,
  unitId: string,
  correctCount: number,
  totalCount: number,
): Promise<{ unitCompleted: boolean }> {
  const wasComplete = isUnitComplete(unitId);
  finishSession(sessionId, correctCount, totalCount);
  logStudy({ activity: 'curriculum', notes: unitId });
  checkAndUnlockNext(unitId);
  const isCompleteNow = isUnitComplete(unitId);

  return { unitCompleted: isCompleteNow && !wasComplete };
}
