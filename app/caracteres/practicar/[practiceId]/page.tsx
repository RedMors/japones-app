import { notFound } from 'next/navigation';
import { getKanaRowPractice } from '@/lib/curriculum/kana-sentences';
import { KanaSentenceSession } from '@/components/curriculum/kana-sentence-session';
import { logKanaPracticeSession } from './actions';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

export const dynamic = 'force-dynamic';

export default async function KanaPracticePage({
  params,
}: {
  params: Promise<{ practiceId: string }>;
}) {
  const { practiceId } = await params;
  const row = getKanaRowPractice(practiceId);
  if (!row) notFound();
  const dict = getDictionary(await getLanguage());

  async function onFinish() {
    'use server';
    await logKanaPracticeSession(practiceId);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16 lg:max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        <span className="jp">{row.chars}</span> {t(dict, 'caracteres.inSentencesSuffix')}
      </h1>
      <KanaSentenceSession row={row} onFinish={onFinish} />
    </main>
  );
}
