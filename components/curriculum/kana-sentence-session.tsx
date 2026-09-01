'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Volume2, RotateCcw, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { speakJapanese } from '@/lib/tts';
import { playCorrectSound, playIncorrectSound } from '@/lib/sound-effects';
import { HIRAGANA, KATAKANA, HIRAGANA_AVANZADO, KATAKANA_AVANZADO } from '@/lib/curriculum/kana-data';
import { SESSION_SIZE, type KanaSentence, type KanaRowPractice } from '@/lib/curriculum/kana-sentences';
import { useLanguage } from '@/components/language-provider';

type Tile = { key: string; text: string };

/**
 * Caracter suelto -> romaji, para el toggle "Mostrar romaji". Solo cubre
 * caracteres de tamaño normal (un caracter = un sonido) — los chiquitos de
 * yōon (ゃゅょ) y el sokuon (っ) no tienen sonido propio en soledad, se
 * unen al de al lado (シャ = "sha", no "shi"+"a" sueltos), así que quedan
 * sin romaji a propósito en vez de mostrar algo engañoso.
 */
const ROMAJI_BY_CHAR = new Map(
  [...HIRAGANA, ...KATAKANA, ...HIRAGANA_AVANZADO, ...KATAKANA_AVANZADO]
    .filter((k) => k.char.length === 1)
    .map((k) => [k.char, k.romaji]),
);

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Caracteres tocables de una oración: sin puntuación, esa no se arma. */
function correctCharsOf(jp: string): string[] {
  return Array.from(jp.replace(/[。、]/g, ''));
}

/** Banco = caracteres correctos + distractores de OTRAS oraciones del pool
 *  (misma fila) — así el distractor suena parecido, confunde de verdad. */
function buildBank(sentence: KanaSentence, pool: KanaSentence[], numDistractors = 4): Tile[] {
  const correct = correctCharsOf(sentence.jp);
  const seen = new Set(correct);
  const distractors: string[] = [];

  for (const candidate of shuffle(pool.filter((p) => p.id !== sentence.id))) {
    if (distractors.length >= numDistractors) break;
    for (const ch of correctCharsOf(candidate.jp)) {
      if (distractors.length >= numDistractors) break;
      if (seen.has(ch)) continue;
      seen.add(ch);
      distractors.push(ch);
    }
  }

  return shuffle([...correct, ...distractors]).map((text, i) => ({ key: `${i}:${text}`, text }));
}

function sampleSession(pool: KanaSentence[]): KanaSentence[] {
  return shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));
}

type Props = {
  row: KanaRowPractice;
  onFinish: () => void;
};

/**
 * Duolingo "escuchá y seleccioná": se escucha la oración (botón grande,
 * siempre disponible) y se arma tocando fichas de kana en orden — cada
 * ficha también suena sola al tocarla, para chequear de oído antes de
 * confirmar. Recién al comprobar se revela el texto, la lectura y la
 * traducción. `session` se resamplea del pool completo al montar y al pedir
 * "otra sesión" — con un pool más grande que SESSION_SIZE, cada vuelta trae
 * una mezcla distinta.
 */
export function KanaSentenceSession({ row, onFinish }: Props) {
  const { t } = useLanguage();
  // Arranca con el orden fijo del pool y el banco SIN mezclar (igual en
  // servidor y cliente) y recién en el useEffect de abajo se sortea de
  // verdad. Math.random() corriendo durante el render (server o el primer
  // render del cliente antes de hidratar) descalza el HTML esperado y tira
  // "Hydration failed" — ya pasó dos veces en este componente, no
  // "optimizar" esto de nuevo sin useEffect.
  const initialSession = row.sentences.slice(0, Math.min(SESSION_SIZE, row.sentences.length));
  const [session, setSession] = useState<KanaSentence[]>(initialSession);
  const [index, setIndex] = useState(0);
  const [bank, setBank] = useState<Tile[]>(() =>
    correctCharsOf(initialSession[0].jp).map((text, i) => ({ key: `${i}:${text}`, text })),
  );
  const [answer, setAnswer] = useState<Tile[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [ready, setReady] = useState(false);
  const [showRomaji, setShowRomaji] = useState(false);

  const sentence = session[index];
  const targetLength = correctCharsOf(sentence.jp).length;

  useEffect(() => {
    const fresh = sampleSession(row.sentences);
    setSession(fresh);
    setBank(buildBank(fresh[0], row.sentences));
    setReady(true);
    // Una sola vez al montar — "otra sesión" resamplea explícitamente vía handleAnother.
  }, []);

  // Se reproduce sola al entrar a cada oración (como Duolingo) — sin esto,
  // hay que acordarse de tocar el parlante antes de poder intentar.
  useEffect(() => {
    if (ready) speakJapanese(sentence.jp);
  }, [ready, sentence.id, sentence.jp]);

  function playTile(text: string) {
    speakJapanese(text);
  }

  function pick(tile: Tile) {
    if (checked) return;
    playTile(tile.text);
    setBank((b) => b.filter((t) => t.key !== tile.key));
    setAnswer((a) => [...a, tile]);
  }

  function unpick(tile: Tile) {
    if (checked) return;
    setAnswer((a) => a.filter((t) => t.key !== tile.key));
    setBank((b) => [...b, tile]);
  }

  function handleCheck() {
    if (checked || answer.length === 0) return;
    const built = answer.map((t) => t.text).join('');
    const isCorrect = built === correctCharsOf(sentence.jp).join('');
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  }

  function handleNext() {
    const isLast = index + 1 >= session.length;
    if (!isLast) {
      const next = session[index + 1];
      setIndex((i) => i + 1);
      setBank(buildBank(next, row.sentences));
      setAnswer([]);
      setChecked(false);
      setCorrect(false);
      return;
    }
    setFinished(true);
    onFinish();
  }

  function handleAnother() {
    const fresh = sampleSession(row.sentences);
    setSession(fresh);
    setBank(buildBank(fresh[0], row.sentences));
    setAnswer([]);
    setIndex(0);
    setChecked(false);
    setCorrect(false);
    setScore(0);
    setFinished(false);
  }

  if (!ready || !sentence) {
    return <p className="text-center text-sm text-muted-foreground">{t('kana.loading')}</p>;
  }

  if (finished) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">
          {t('session.scoreOf', { correct: score, total: session.length })}
        </h1>
        <p className="text-muted-foreground">{t('kana.practicedSentence', { chars: row.chars })}</p>
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="secondary" onClick={handleAnother}>
            <RotateCcw className="mr-2 size-4" /> {t('kana.anotherSession')}
          </Button>
          <Button asChild>
            <Link href="/caracteres">{t('session.back')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Progress value={((index + (checked ? 1 : 0)) / session.length) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{session.length}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{t('kana.listenAndTap')}</p>
        <Button variant="ghost" size="sm" onClick={() => setShowRomaji((s) => !s)} className="shrink-0">
          {showRomaji ? <EyeOff className="mr-1.5 size-3.5" /> : <Eye className="mr-1.5 size-3.5" />}
          {showRomaji ? t('kana.hideRomaji') : t('kana.showRomaji')}
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <Button
            variant="secondary"
            size="icon"
            className="size-16 rounded-full"
            onClick={() => speakJapanese(sentence.jp)}
            title={t('kana.listenSentence')}
          >
            <Volume2 className="size-6" />
          </Button>

          <div className="flex min-h-14 w-full flex-wrap items-center justify-center gap-2 border-b border-dashed border-border pb-4">
            {answer.length === 0 && (
              <span className="text-sm text-muted-foreground">{t('kana.tapInOrder')}</span>
            )}
            {answer.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => unpick(tile)}
                disabled={checked}
                className="jp flex flex-col items-center rounded-lg border border-primary bg-primary/10 px-3 py-2 text-lg disabled:cursor-default"
              >
                {tile.text}
                {showRomaji && ROMAJI_BY_CHAR.has(tile.text) && (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {ROMAJI_BY_CHAR.get(tile.text)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {checked && (
            <div
              className={cn(
                'w-full space-y-1 rounded-lg border p-4 text-center',
                correct
                  ? 'border-accent-foreground bg-accent text-accent-foreground'
                  : 'border-destructive text-destructive',
              )}
            >
              <p className="jp flex items-center justify-center gap-2 text-lg">
                {correct ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
                {sentence.jp}
              </p>
              <p className="text-xs opacity-80">{sentence.reading}</p>
              <p className="text-sm font-medium opacity-90">{sentence.translation}</p>
              {!correct && (
                <p className="jp text-xs opacity-70">
                  {t('kana.youBuilt', { text: answer.map((tile) => tile.text).join('') })}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {bank.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => pick(tile)}
                disabled={checked}
                className="jp flex flex-col items-center rounded-lg border border-border px-3 py-2 text-lg transition-colors hover:bg-muted/50 disabled:cursor-default disabled:opacity-40"
              >
                {tile.text}
                {showRomaji && ROMAJI_BY_CHAR.has(tile.text) && (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {ROMAJI_BY_CHAR.get(tile.text)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {checked ? (
        <Button className="w-full" size="lg" onClick={handleNext}>
          {index + 1 >= session.length ? t('kana.finish') : t('kana.next')}
        </Button>
      ) : (
        <Button className="w-full" size="lg" onClick={handleCheck} disabled={answer.length !== targetLength}>
          {t('session.check')}
        </Button>
      )}
    </div>
  );
}
