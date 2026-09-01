'use client';

import { useEffect, useMemo, useState } from 'react';
import { Volume2, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FuriganaText } from '@/components/curriculum/furigana-text';
import { RomajiText } from '@/components/curriculum/romaji-text';
import { stripFurigana, toReading } from '@/lib/curriculum/furigana';
import { scriptOf } from '@/lib/normalize';
import { speakJapanese } from '@/lib/tts';
import { playCorrectSound, playIncorrectSound } from '@/lib/sound-effects';
import type { SceneImageItem } from '@/lib/curriculum/scenes-data';
import { useLanguage } from '@/components/language-provider';

const SCRIPT_LABEL = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
  mixed: 'Kanji + kana',
} as const;

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
  const { t } = useLanguage();
  // Sin mezclar al arrancar (igual en servidor y cliente) — Math.random()
  // durante el render inicial descalza la hidratación ("Hydration failed"),
  // mismo bug ya visto y arreglado en KanaSentenceSession y WordBuilder.
  // Recién se mezcla en el useEffect de abajo, client-only.
  const [questions, setQuestions] = useState(() =>
    items.map((item) => ({ item, choices: [item, ...items.filter((i) => i.id !== item.id).slice(0, 2)] })),
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [ready, setReady] = useState(false);
  const [showRomaji, setShowRomaji] = useState(false);

  useEffect(() => {
    setQuestions(buildQuestions(items));
    setReady(true);
    // Una sola vez al montar — este quiz no tiene "otra sesión", se arma una vez.
  }, []);

  const question = questions[index];
  const prompt = useMemo(() => stripFurigana(question.item.word), [question]);

  if (!ready) return null;

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

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {t('imageQuiz.whichImage', { reading: question.item.reading })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => setShowRomaji((s) => !s)}
        >
          {showRomaji ? <EyeOff className="mr-1.5 size-3.5" /> : <Eye className="mr-1.5 size-3.5" />}
          {showRomaji ? t('kana.hideRomaji') : t('kana.showRomaji')}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <p className="jp text-3xl">
            <FuriganaText text={question.item.word} />
          </p>
          <Button variant="ghost" size="icon" onClick={() => speakJapanese(prompt)} title={t('session.listen')}>
            <Volume2 className="size-4" />
          </Button>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {SCRIPT_LABEL[scriptOf(prompt)]}
        </span>
        {showRomaji && (
          <p className="text-2xl">
            <RomajiText text={toReading(question.item.word)} />
          </p>
        )}
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
                  {t('imageQuiz.noImage')}
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
              {t('session.continue')}
            </Button>
          ) : (
            <Button className="flex-1" size="lg" onClick={handleCheck} disabled={!picked}>
              {t('session.check')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
