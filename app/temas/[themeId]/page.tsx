import { notFound } from 'next/navigation';
import { getSceneTheme } from '@/lib/curriculum/scenes-data';
import { WordBuilder } from '@/components/curriculum/word-builder';
import { logSceneSession } from './actions';

export default async function ThemePage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const theme = getSceneTheme(themeId);
  if (!theme) notFound();

  async function onFinish() {
    'use server';
    await logSceneSession(themeId);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16 lg:max-w-2xl">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <span>{theme.emoji}</span> {theme.title}
      </h1>
      <WordBuilder themeTitle={theme.title} phrases={theme.phrases} onFinish={onFinish} />
    </main>
  );
}
