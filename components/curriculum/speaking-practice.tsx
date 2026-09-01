'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mic, Volume2, Check, X, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { speakJapanese } from '@/lib/tts';
import {
  recognizeJapaneseSpeech,
  isSpeechRecognitionAvailable,
  type RecognizeResult,
} from '@/lib/speech-recognition';
import { katakanaToHiragana, normalizeLemma } from '@/lib/normalize';
import type { SpeakingItem } from '@/lib/curriculum/progress';
import type { logSpeakingSession } from '@/app/hablar/actions';
import { useLanguage } from '@/components/language-provider';

type Props = {
  items: SpeakingItem[];
  logSession: typeof logSpeakingSession;
};

type Phase = 'idle' | 'listening' | 'result';

function isMatch(transcript: string, item: SpeakingItem): boolean {
  const t = normalizeLemma(transcript);
  const word = normalizeLemma(item.word);
  const tHira = katakanaToHiragana(t);
  const readingHira = katakanaToHiragana(normalizeLemma(item.reading));
  return t === word || tHira === readingHira;
}

export function SpeakingPractice({ items, logSession }: Props) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const supported = isSpeechRecognitionAvailable();
  const item = items[index];

  function handleListen() {
    if (!supported || phase === 'listening') return;
    setPhase('listening');
    setMicError(null);
    recognizeJapaneseSpeech().then((result: RecognizeResult) => {
      if (!result.ok) {
        setMicError(
          result.error === 'not-allowed'
            ? t('speaking.micNotAllowed')
            : result.error === 'no-speech'
              ? t('speaking.noSpeech')
              : t('speaking.genericError'),
        );
        setPhase('idle');
        return;
      }
      const isCorrect = isMatch(result.transcript, item);
      setTranscript(result.transcript);
      setCorrect(isCorrect);
      if (isCorrect) setScore((s) => s + 1);
      setPhase('result');
    });
  }

  function handleNext() {
    const isLast = index + 1 >= items.length;
    setTranscript('');
    setMicError(null);
    setPhase('idle');
    if (isLast) {
      startTransition(() => {
        void logSession();
      });
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
  }

  if (!supported) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t('speaking.notSupported')}
        </CardContent>
      </Card>
    );
  }

  if (finished) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div className="space-y-4 text-center">
        {pct >= 80 && <PartyPopper className="mx-auto size-10 text-accent-foreground" />}
        <h1 className="text-2xl font-semibold">
          {t('session.scoreOf', { correct: score, total: items.length })}
        </h1>
        <p className="text-muted-foreground">
          {pct >= 80 ? t('speaking.excellentPronunciation') : t('speaking.keepPracticing')}
        </p>
        <Button asChild className="mt-2">
          <Link href="/">{t('session.back')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Progress value={(index / items.length) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{items.length}
        </span>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-12 lg:py-16">
          <div className="flex items-center gap-2">
            <p className="jp text-center text-6xl leading-loose lg:text-8xl">{item.word}</p>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 self-start text-muted-foreground"
              onClick={() => speakJapanese(item.word)}
              title={t('speaking.listenPronunciation')}
            >
              <Volume2 className="size-4" />
            </Button>
          </div>
          {item.meaning && (
            <p className="text-center text-sm text-muted-foreground">{item.meaning}</p>
          )}

          {phase === 'result' ? (
            <div
              className={`w-full rounded-lg border p-4 text-center ${
                correct
                  ? 'border-accent-foreground bg-accent text-accent-foreground'
                  : 'border-destructive text-destructive'
              }`}
            >
              <p className="flex items-center justify-center gap-1.5 text-sm font-medium">
                {correct ? <Check className="size-4" /> : <X className="size-4" />}
                {correct ? t('speaking.wellPronounced') : t('speaking.notQuiteMatch')}
              </p>
              <p className="mt-1 text-xs opacity-80">{t('speaking.heard', { text: transcript })}</p>
              {!correct && (
                <p className="mt-1 text-xs opacity-80">{t('speaking.expected', { text: item.reading })}</p>
              )}
            </div>
          ) : (
            <Button
              size="lg"
              variant={phase === 'listening' ? 'secondary' : 'default'}
              onClick={handleListen}
              disabled={phase === 'listening'}
              className="gap-2"
            >
              <Mic className="size-4" />
              {phase === 'listening' ? t('speaking.listening') : t('speaking.pronounce')}
            </Button>
          )}
          {micError && <p className="text-xs text-destructive">{micError}</p>}
        </CardContent>
      </Card>

      {phase === 'result' && (
        <Button className="w-full" size="lg" onClick={handleNext}>
          {t('session.continue')}
        </Button>
      )}
    </div>
  );
}
