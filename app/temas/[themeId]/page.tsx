import { notFound } from 'next/navigation';
import { getSceneTheme } from '@/lib/curriculum/scenes-data';
import { SceneSession } from '@/components/curriculum/scene-session';
import { getOrGenerateImageKey } from '@/lib/image-cache';
import { logSceneSession } from './actions';

export const dynamic = 'force-dynamic';

export default async function ThemePage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const theme = getSceneTheme(themeId);
  if (!theme) notFound();

  // Se generan (o se recuperan del caché) ACÁ, en el servidor, antes de
  // mandar nada al cliente — así el ejercicio arranca con las imágenes ya
  // resueltas, en vez de pedirlas una por una desde el navegador.
  const imageUrls: Record<string, string> = {};
  if (theme.imageItems) {
    for (const item of theme.imageItems) {
      try {
        const key = await getOrGenerateImageKey(item.imagePrompt);
        imageUrls[item.id] = `/api/scene-image/${key}`;
      } catch {
        // Sin OPENROUTER_API_KEY configurada, o falló la generación: el
        // ejercicio de imágenes sigue andando, solo sin imagen en esa opción
        // (ImageQuiz ya maneja el caso "sin imagen").
      }
    }
  }

  async function onFinish() {
    'use server';
    await logSceneSession(themeId);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16 lg:max-w-2xl">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <span>{theme.emoji}</span> {theme.title}
      </h1>
      <SceneSession theme={theme} imageUrls={imageUrls} onFinish={onFinish} />
    </main>
  );
}
