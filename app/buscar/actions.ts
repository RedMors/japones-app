'use server';

import { searchWords, type DictEntry } from '@/lib/dictionary';

export async function search(query: string): Promise<DictEntry[]> {
  return searchWords(query, 20);
}
