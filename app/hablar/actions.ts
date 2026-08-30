'use server';

import { logStudy } from '@/lib/study-log';

export async function logSpeakingSession(): Promise<void> {
  logStudy({ activity: 'speaking' });
}
