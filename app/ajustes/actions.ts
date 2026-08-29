'use server';

import { saveOpenRouterSettings } from '@/lib/settings';

export async function saveSettings(apiKey: string, model: string): Promise<void> {
  saveOpenRouterSettings(apiKey, model);
}
