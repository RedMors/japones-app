'use client';

import { useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FuriganaText } from '@/components/curriculum/furigana-text';
import { stripFurigana } from '@/lib/curriculum/furigana';
import { speakJapanese } from '@/lib/tts';
import { playCorrectSound, playIncorrectSound } from '@/lib/sound-effects';
import type { ScenePhrase } from '@/lib/curriculum/scenes-data';

type Tile = { key: string; text: string };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function tilesOf(phrase: ScenePhrase): Tile[] {
  return phrase.tiles.map((text, i) => ({ key: `${phrase.id}:${i}`, text }));
}

type Props = {
  phrases: ScenePhrase[];
  onFinish: (score: number, total: number) => void;
};

export function WordBuilder({ phrases, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  // Sin mezclar al arrancar (igual en servidor y cliente) — Math.random()
  // durante el render inicial descalza la hidratación ("Hydration failed"),
  // mismo bug ya visto y arreglado en KanaSentenceSession. Recién se mezcla
  // en el useEffect de abajo, client-only.
  const [bank, setBank] = useState<Tile[]>(() => tilesOf(phrases[0]));
  const [answer, setAnswer] = useState<Tile[]>([]);
  const [phase, setPhase] = useState<'building' | 'result'>('building');
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  // Sin esto, el primer render (server + primer paint del cliente) muestra
  // las fichas en el orden correcto — literalmente la respuesta, justo lo
  // que este ejercicio existe para no mostrar. Se oculta hasta que el
  // useEffect de abajo ya mezcló.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBank(shuffle(tilesOf(phrases[0])));
    setReady(true);
    // Una sola vez al montar — handleNext ya mezcla la siguiente explícitamente.
  }, []);

  const phrase = phrases[index];
  const fullSentence = useMemo(() => phrase.tiles.join(''), [phrase]);

  if (!ready) return null;

  function pick(tile: Tile) {
    if (phase === 'result') return;
    setBank((b) => b.filter((t) => t.key !== tile.key));
    setAnswer((a) => [...a, tile]);
  }

  function unpick(tile: Tile) {
    if (phase === 'result') return;
    setAnswer((a) => a.filter((t) => t.key !== tile.key));
    setBank((b) => [...b, tile]);
  }

  function handleCheck() {
    const isCorrect = answer.map((t) => t.text).join('') === phrase.tiles.join('');
    setCorrect(isCorrect);
    setPhase('result');
    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  }

  function handleNext() {
    const isLast = index + 1 >= phrases.length;
    if (isLast) {
      onFinish(score, phrases.length);
      return;
    }
    const next = phrases[index + 1];
    setIndex((i) => i + 1);
    setBank(shuffle(tilesOf(next)));
    setAnswer([]);
    setPhase('building');
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <Progress value={(index / phrases.length) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{phrases.length}
        </span>
      </div>

      <p className="text-sm font-medium text-muted-foreground">Escuchá y armá la oración</p>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <Button
            variant="secondary"
            size="icon"
            className="size-16 rounded-full"
            onClick={() => speakJapanese(stripFurigana(fullSentence))}
            title="Escuchar"
          >
            <Volume2 className="size-6" />
          </Button>

          <div className="flex min-h-14 w-full flex-wrap items-center justify-center gap-2 border-b border-dashed border-border pb-4">
            {answer.length === 0 && (
              <span className="text-sm text-muted-foreground">Tocá las palabras en orden</span>
            )}
            {answer.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => unpick(tile)}
                disabled={phase === 'result'}
                className="jp rounded-lg border border-primary bg-primary/10 px-3 py-2 text-lg disabled:cursor-default"
              >
                <FuriganaText text={tile.text} />
              </button>
            ))}
          </div>

          {phase === 'result' && (
            <div
              className={`w-full rounded-lg border p-4 text-center ${
                correct
                  ? 'border-accent-foreground bg-accent text-accent-foreground'
                  : 'border-destructive text-destructive'
              }`}
            >
              <p className="jp text-lg">
                <FuriganaText text={fullSentence} />
              </p>
              <p className="mt-1 text-xs opacity-80">{phrase.translation}</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {bank.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => pick(tile)}
                disabled={phase === 'result'}
                className="jp rounded-lg border border-border px-3 py-2 text-lg transition-colors hover:bg-muted/50 disabled:cursor-default disabled:opacity-40"
              >
                <FuriganaText text={tile.text} />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-6 py-4 lg:max-w-2xl">
          {phase === 'result' ? (
            <Button className="flex-1" size="lg" onClick={handleNext}>
              Continuar
            </Button>
          ) : (
            <Button
              className="flex-1"
              size="lg"
              onClick={handleCheck}
              disabled={answer.length === 0 || bank.length > 0}
            >
              Comprobar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
