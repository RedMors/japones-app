'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageQuiz } from '@/components/curriculum/image-quiz';
import { WordBuilder } from '@/components/curriculum/word-builder';
import type { SceneTheme } from '@/lib/curriculum/scenes-data';

type Props = {
  // Sin `icon`: es un componente, no serializa de Server a Client Component.
  theme: Omit<SceneTheme, 'icon'>;
  imageUrls: Record<string, string>;
  onFinish: () => void;
};

/** Encadena vocabulario visual -> armar oraciones, con un solo resultado
 *  final combinado. Si el tema no tiene imágenes (piloto solo en
 *  Restaurante), arranca directo en las oraciones. */
export function SceneSession({ theme, imageUrls, onFinish }: Props) {
  const hasImages = (theme.imageItems?.length ?? 0) > 0;
  const [phase, setPhase] = useState<'images' | 'phrases' | 'done'>(
    hasImages ? 'images' : 'phrases',
  );
  const [imageScore, setImageScore] = useState<{ score: number; total: number } | null>(null);
  const [phraseScore, setPhraseScore] = useState(0);

  if (phase === 'images' && theme.imageItems) {
    return (
      <ImageQuiz
        items={theme.imageItems}
        imageUrls={imageUrls}
        onDone={(score, total) => {
          setImageScore({ score, total });
          setPhase('phrases');
        }}
      />
    );
  }

  if (phase === 'phrases') {
    return (
      <WordBuilder
        phrases={theme.phrases}
        onFinish={(score) => {
          setPhraseScore(score);
          setPhase('done');
          onFinish();
        }}
      />
    );
  }

  const totalCorrect = (imageScore?.score ?? 0) + phraseScore;
  const totalQuestions = (imageScore?.total ?? 0) + theme.phrases.length;
  const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-4 text-center">
      {pct >= 80 && <PartyPopper className="mx-auto size-10 text-accent-foreground" />}
      <h1 className="text-2xl font-semibold">
        {totalCorrect} de {totalQuestions}
      </h1>
      <p className="text-muted-foreground">
        {pct >= 80 ? `¡Ya te sale natural en "${theme.title}"!` : 'Seguí practicando esta escena.'}
      </p>
      <Button asChild className="mt-2">
        <Link href="/temas">Volver</Link>
      </Button>
    </div>
  );
}
