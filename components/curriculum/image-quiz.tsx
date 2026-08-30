'use client';

import { useMemo, useState } from 'react';
import { Volume2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FuriganaText } from '@/components/curriculum/furigana-text';
import { stripFurigana } from '@/lib/curriculum/furigana';
import { speakJapanese } from '@/lib/tts';
import { playCorrectSound, playIncorrectSound } from '@/lib/sound-effects';
import type { SceneImageItem } from '@/lib/curriculum/scenes-data';

type Question = { item: SceneImageItem; choices: SceneImageItem[] };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuestions(items: SceneImageItem[]): Question[] {
  return shuffle(items).map((item) => {
    const distractors = shuffle(items.filter((i) => i.id !== item.id)).slice(0, 2);
    return { item, choices: shuffle([item, ...distractors]) };
  });
}

type Props = {
  items: SceneImageItem[];
  imageUrls: Record<string, string>;
  onDone: (score: number, total: number) => void;
};

export function ImageQuiz({ items, imageUrls, onDone }: Props) {
  const [questions] = useState(() => buildQuestions(items));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[index];
  const prompt = useMemo(() => stripFurigana(question.item.word), [question]);

  function handlePick(id: string) {
    if (revealed) return;
    setPicked(id);
  }

  function handleCheck() {
    if (!picked) return;
    const isCorrect = picked === question.item.id;
    setRevealed(true);
    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  }

  function handleNext() {
    const isLast = index + 1 >= questions.length;
    if (isLast) {
      onDone(score, questions.length);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <Progress value={(index / questions.length) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        ¿Cuál de estas imágenes es &quot;{question.item.reading}&quot;?
      </p>

      <div className="flex items-center justify-center gap-2">
        <p className="jp text-3xl">
          <FuriganaText text={question.item.word} />
        </p>
        <Button variant="ghost" size="icon" onClick={() => speakJapanese(prompt)} title="Escuchar">
          <Volume2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {question.choices.map((choice) => {
          const isPicked = picked === choice.id;
          const isAnswer = choice.id === question.item.id;
          const url = imageUrls[choice.id];

          return (
            <button
              key={choice.id}
              type="button"
              disabled={revealed}
              onClick={() => handlePick(choice.id)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-colors disabled:cursor-default ${
                !revealed && isPicked
                  ? 'border-primary'
                  : revealed && isAnswer
                    ? 'border-accent-foreground'
                    : revealed && isPicked && !isAnswer
                      ? 'border-destructive'
                      : 'border-border'
              }`}
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground">
                  sin imagen
                </div>
              )}
              {revealed && isAnswer && (
                <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-accent-foreground text-accent">
                  <Check className="size-4" />
                </span>
              )}
              {revealed && isPicked && !isAnswer && (
                <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-destructive text-white">
                  <X className="size-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <Card>
          <CardContent className="py-3 text-center text-sm text-muted-foreground">
            {question.item.reading} — {question.item.translation}
          </CardContent>
        </Card>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-6 py-4 lg:max-w-2xl">
          {revealed ? (
            <Button className="flex-1" size="lg" onClick={handleNext}>
              Continuar
            </Button>
          ) : (
            <Button className="flex-1" size="lg" onClick={handleCheck} disabled={!picked}>
              Comprobar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
