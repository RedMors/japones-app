'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, PartyPopper, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { speakJapanese } from '@/lib/tts';
import { stripFurigana } from '@/lib/curriculum/furigana';
import { FuriganaText } from '@/components/curriculum/furigana-text';
import type { MultipleChoiceQuestion } from '@/lib/curriculum/exercises';
import type { beginSession, submitAnswer, endSession } from '@/app/[unitId]/actions';

type Props = {
  unitId: string;
  unitTitle: string;
  questions: MultipleChoiceQuestion[];
  beginSession: typeof beginSession;
  submitAnswer: typeof submitAnswer;
  endSession: typeof endSession;
  /** Repaso libre: no persiste sesión ni progreso, es solo un autochequeo. */
  readOnly?: boolean;
};

export function SessionRunner({
  unitId,
  unitTitle,
  questions,
  beginSession,
  submitAnswer,
  endSession,
  readOnly = false,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // La sesión se crea en un efecto, no durante el render: el render de un
  // Server o Client Component puede repetirse (prefetch de Link,
  // revalidaciones, Strict Mode), y cada repetición insertaría una sesión
  // fantasma si el side effect viviera ahí. El ref evita el doble disparo del
  // efecto que Strict Mode hace a propósito en desarrollo.
  const sessionIdPromise = useRef<Promise<number> | null>(null);
  const startedRef = useRef(false);
  useEffect(() => {
    if (readOnly || startedRef.current) return;
    startedRef.current = true;
    sessionIdPromise.current = beginSession(unitId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [unitCompleted, setUnitCompleted] = useState(false);

  // Congelado al montar: endSession() dispara router.refresh(), que vuelve a
  // renderizar el Server Component y le pasa un `questions` NUEVO y más
  // corto a esta misma instancia (ya no quedan ítems "nunca vistos" después
  // de grabar el progreso). Sin este freeze, la pantalla de resultado mezcla
  // el correctCount viejo con el total de la sesión siguiente.
  const [totalQuestions] = useState(() => questions.length);
  const question = questions[index];

  function handleChoice(choice: string) {
    if (selected) return; // ya respondió esta pregunta
    const isCorrect = choice === question.answer;
    setSelected(choice);
    if (isCorrect) setCorrectCount((c) => c + 1);
    if (!readOnly) {
      startTransition(() => {
        void submitAnswer(unitId, question.itemId, isCorrect);
      });
    }
  }

  function handleContinue() {
    const isLast = index + 1 >= totalQuestions;
    if (!isLast) {
      setIndex((i) => i + 1);
      setSelected(null);
      return;
    }
    if (readOnly) {
      setFinished(true);
      return;
    }
    const finalCorrect = correctCount;
    startTransition(async () => {
      // Si el usuario contesta las 10 preguntas más rápido que lo que tarda
      // en resolver beginSession(), se espera acá en vez de perder el cierre.
      const sessionId = await sessionIdPromise.current;
      if (sessionId === null || sessionId === undefined) return;
      const result = await endSession(sessionId, unitId, finalCorrect, totalQuestions);
      setUnitCompleted(result.unitCompleted);
      setFinished(true);
      router.refresh();
    });
  }

  if (finished) {
    return (
      <div className="space-y-4 text-center">
        {readOnly ? (
          <>
            <h1 className="text-2xl font-semibold">
              {correctCount} de {totalQuestions}
            </h1>
            <p className="text-muted-foreground">Repaso libre — no afectó tu progreso.</p>
          </>
        ) : unitCompleted ? (
          <>
            <PartyPopper className="mx-auto size-10 text-accent-foreground" />
            <h1 className="text-2xl font-semibold">¡{unitTitle} completa!</h1>
            <p className="text-muted-foreground">
              Dominaste todo. La siguiente unidad ya está disponible.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">
              {correctCount} de {totalQuestions}
            </h1>
            <p className="text-muted-foreground">Seguí así, un poco más.</p>
          </>
        )}
        <Button asChild className="mt-2">
          <Link href="/">Volver</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Progress value={((index + (selected ? 1 : 0)) / totalQuestions) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{totalQuestions}
        </span>
      </div>

      {readOnly && (
        <p className="text-center text-xs text-muted-foreground">
          Repaso libre — esto no cambia tu progreso.
        </p>
      )}

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <div className="flex items-center gap-2">
            <FuriganaText
              text={question.prompt}
              className={cn(
                'jp text-center leading-loose',
                stripFurigana(question.prompt).length <= 4 ? 'text-6xl' : 'text-3xl',
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 self-start text-muted-foreground"
              onClick={() => speakJapanese(stripFurigana(question.prompt))}
              title="Escuchar"
            >
              <Volume2 className="size-4" />
            </Button>
          </div>
          {question.subtext && (
            <p className="text-center text-sm text-muted-foreground">{question.subtext}</p>
          )}
          <div className="grid w-full grid-cols-2 gap-3">
            {question.choices.map((choice) => {
              const isSelected = selected === choice;
              const isAnswer = choice === question.answer;
              const revealed = selected !== null;
              const reading = question.choiceReadings?.[choice];

              return (
                <Button
                  key={choice}
                  variant="outline"
                  size="lg"
                  disabled={revealed}
                  onClick={() => handleChoice(choice)}
                  className={cn(
                    'h-auto min-h-14 flex-col gap-0.5 whitespace-normal py-2 text-base',
                    revealed && isAnswer && 'border-accent-foreground bg-accent text-accent-foreground',
                    revealed && isSelected && !isAnswer && 'border-destructive text-destructive',
                  )}
                >
                  <span>
                    {revealed && isAnswer && <Check className="mr-1 inline size-4" />}
                    {revealed && isSelected && !isAnswer && <X className="mr-1 inline size-4" />}
                    {choice}
                  </span>
                  {reading && reading !== choice && (
                    <span className="text-xs font-normal opacity-70">{reading}</span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Button className="w-full" size="lg" onClick={handleContinue}>
          Continuar
        </Button>
      )}
    </div>
  );
}
