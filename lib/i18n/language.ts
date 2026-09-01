import { cookies } from 'next/headers';
import type { Lang } from './dictionary';
import { LANG_COOKIE } from './cookie';

export async function getLanguage(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value === 'en' ? 'en' : 'es';
}
