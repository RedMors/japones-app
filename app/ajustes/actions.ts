'use server';

import { saveOpenRouterSettings } from '@/lib/settings';
import { setGoal, type JlptGoalLevel } from '@/lib/curriculum/progress';

export async function saveSettings(apiKey: string, model: string): Promise<void> {
  saveOpenRouterSettings(apiKey, model);
}

export async function saveGoal(level: JlptGoalLevel, targetDate: string): Promise<void> {
  setGoal(level, targetDate || null);
}
