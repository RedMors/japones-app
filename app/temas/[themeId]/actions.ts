'use server';

import { logStudy } from '@/lib/study-log';

export async function logSceneSession(themeId: string): Promise<void> {
  logStudy({ activity: 'curriculum', notes: `tema:${themeId}` });
}
