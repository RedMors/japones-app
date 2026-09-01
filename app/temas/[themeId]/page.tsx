import { notFound } from 'next/navigation';
import { getSceneTheme } from '@/lib/curriculum/scenes-data';
import { SceneSession } from '@/components/curriculum/scene-session';
import { getOrGenerateImageKey } from '@/lib/image-cache';
import { getLanguage } from '@/lib/i18n/language';
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
  const lang = await getLanguage();

  // Se generan (o se recuperan del caché) ACÁ, en el servidor, antes de
  // mandar nada al cliente — así el ejercicio arranca con las imágenes ya
  // resueltas, en vez de pedirlas una por una desde el navegador.
  const imageUrls: Record<string, string> = {};
  if (theme.imageItems) {
    for (const item of theme.imageItems) {
      try {
        const key = await getOrGenerateImageKey(item.imagePrompt);
        imageUrls[item.id] = `/api/scene-image/${key}`;
      } catch (err) {
        // Sin OPENROUTER_API_KEY configurada, o falló la generación: el
        // ejercicio de imágenes sigue andando, solo sin imagen en esa opción
        // (ImageQuiz ya maneja el caso "sin imagen"). Log server-side para
        // poder diagnosticar — este catch no debe ser una caja negra.
        console.error(`[temas/${themeId}] no se pudo generar imagen para "${item.id}":`, err);
      }
    }
  }

  async function onFinish() {
    'use server';
    await logSceneSession(themeId);
  }

  // theme.icon es un componente (función) — no se puede pasar como prop a
  // un Client Component, React Server Components solo serializa datos
  // planos. Se usa acá arriba (server) y se excluye de lo que baja al
  // cliente.
  const { icon: ThemeIcon, ...sceneOnly } = theme;

  return (
    // pb chico a propósito: WordBuilder/ImageQuiz ya reservan su propio
    // espacio abajo (pb-28) para el botón fijo — ver mismo fix en
    // app/[unitId]/page.tsx.
    <main className="mx-auto max-w-xl px-6 pt-16 pb-4 lg:max-w-2xl">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <ThemeIcon className="size-6 shrink-0" /> {theme.title[lang]}
      </h1>
      <SceneSession theme={sceneOnly} imageUrls={imageUrls} onFinish={onFinish} />
    </main>
  );
}
