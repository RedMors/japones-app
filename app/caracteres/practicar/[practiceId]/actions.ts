'use server';

import { logStudy } from '@/lib/study-log';

export async function logKanaPracticeSession(practiceId: string): Promise<void> {
  logStudy({ activity: 'curriculum', notes: `kana-practica:${practiceId}` });
}
