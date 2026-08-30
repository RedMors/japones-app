'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, PartyPopper, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { speakJapanese } from '@/lib/tts';
import { stripFurigana } from '@/lib/curriculum/furigana';
import { FuriganaText } from '@/components/curriculum/furigana-text';
import type { MultipleChoiceQuestion } from '@/lib/curriculum/exercises';
import type { beginSession, submitAnswer, endSession, explainGrammar } from '@/app/[unitId]/actions';

type Props = {
  unitId: string;
  unitTitle: string;
  questions: MultipleChoiceQuestion[];
  beginSession: typeof beginSession;
  submitAnswer: typeof submitAnswer;
  endSession: typeof endSession;
  /** Solo se pasa en unidades de gramática — ahí tiene sentido pedir el "por qué". */
  explainGrammar?: typeof explainGrammar;
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
  explainGrammar,
  readOnly = false,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, startExplainTransition] = useTransition();

  // La sesión se crea recién con la primera respuesta, no al montar: si la
  // unidad monta dos veces sin que el usuario llegue a contestar nada
  // (doble-click, recarga a mitad de carga), antes quedaba una sesión
  // huérfana (0/0, nunca termina) en curriculum_sessions. Creándola on-demand,
  // sin interacción no hay sesión que crear.
  const sessionIdPromise = useRef<Promise<number> | null>(null);
  function ensureSession(): Promise<number> | null {
    if (readOnly) return null;
    if (!sessionIdPromise.current) sessionIdPromise.current = beginSession(unitId);
    return sessionIdPromise.current;
  }
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
      ensureSession();
      startTransition(() => {
        void submitAnswer(unitId, question.itemId, isCorrect);
      });
    }
  }

  function handleExplain() {
    if (!explainGrammar) return;
    setExplanation(null);
    startExplainTransition(async () => {
      const text = await explainGrammar(question.prompt, question.answer, question.subtext);
      setExplanation(text);
    });
  }

  function handleContinue() {
    setExplanation(null);
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
        <CardContent className="flex flex-col items-center gap-6 py-12 lg:gap-8 lg:py-16">
          <div className="flex items-center gap-2">
            <FuriganaText
              text={question.prompt}
              className={cn(
                'jp text-center leading-loose',
                stripFurigana(question.prompt).length <= 4
                  ? 'text-6xl lg:text-8xl'
                  : 'text-3xl lg:text-4xl',
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 self-start text-muted-foreground lg:size-10"
              onClick={() => speakJapanese(stripFurigana(question.prompt))}
              title="Escuchar"
            >
              <Volume2 className="size-4 lg:size-5" />
            </Button>
          </div>
          {question.subtext && (
            <p className="text-center text-sm text-muted-foreground lg:text-base">
              {question.subtext}
            </p>
          )}
          <div className="grid w-full grid-cols-2 gap-3 lg:gap-4">
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
                    'h-auto min-h-14 flex-col gap-0.5 whitespace-normal py-2 text-base lg:min-h-20 lg:py-4 lg:text-lg',
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
                    <span className="text-xs font-normal opacity-70 lg:text-sm">{reading}</span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selected && explainGrammar && (
        <div className="space-y-3">
          {explanation === null ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleExplain}
              disabled={isExplaining}
            >
              {isExplaining ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 size-4" />
              )}
              {isExplaining ? 'Pensando...' : '¿Por qué? (explicar con IA)'}
            </Button>
          ) : (
            <p className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              {explanation}
            </p>
          )}
        </div>
      )}

      {selected && (
        <Button className="w-full" size="lg" onClick={handleContinue}>
          Continuar
        </Button>
      )}
    </div>
  );
}
