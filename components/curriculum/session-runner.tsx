'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, PartyPopper, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { speakJapanese } from '@/lib/tts';
import { playCorrectSound, playIncorrectSound } from '@/lib/sound-effects';
import { stripFurigana } from '@/lib/curriculum/furigana';
import { FuriganaText } from '@/components/curriculum/furigana-text';
import { buildFillBlank, type SessionQuestion } from '@/lib/curriculum/exercises';
import type { CurriculumItem } from '@/lib/curriculum/units';
import type { beginSession, submitAnswer, endSession, explainGrammar } from '@/app/[unitId]/actions';

type Tile = { key: string; text: string };

function tilesOf(question: Extract<SessionQuestion, { kind: 'fill-blank' }>): Tile[] {
  return question.tiles.map((text, i) => ({ key: `${i}:${text}`, text }));
}

type Props = {
  unitId: string;
  unitTitle: string;
  questions: SessionQuestion[];
  /** Todos los ítems de la unidad — hace falta para armar el fill-blank de retry al vuelo. */
  pool: CurriculumItem[];
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
  pool,
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

  const poolById = useMemo(() => new Map(pool.map((i) => [i.id, i])), [pool]);

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

  // Cola local, no el prop directo: un error empuja un fill-blank de retry
  // al final para confirmar en la MISMA sesión que ya se entendió, no solo
  // que se reconoció entre opciones. Una vez seedeada, ignora props nuevos
  // (ej. el `questions` más corto que llega tras endSession() -> refresh()).
  const [queue, setQueue] = useState<SessionQuestion[]>(() => [...questions]);
  const [index, setIndex] = useState(0);
  // picked = tocado, todavía sin confirmar (resaltado neutro). selected =
  // confirmado y calificado (ahí recién se pinta correcto/incorrecto) — dos
  // pasos, como Duolingo: tocar no compromete la respuesta hasta "Comprobar".
  const [picked, setPicked] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillBank, setFillBank] = useState<Tile[]>(() => {
    const first = questions[0];
    return first?.kind === 'fill-blank' ? tilesOf(first) : [];
  });
  const [fillAnswer, setFillAnswer] = useState<Tile[]>([]);
  const [fillChecked, setFillChecked] = useState(false);
  const [fillCorrect, setFillCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [unitCompleted, setUnitCompleted] = useState(false);

  const question = queue[index];
  const revealed = question.kind === 'choice' ? selected !== null : fillChecked;

  function requeueMissed(itemId: string) {
    const item = poolById.get(itemId);
    if (!item) return;
    setQueue((q) => [...q, buildFillBlank(item, pool)]);
  }

  function handlePick(choice: string) {
    if (selected) return; // ya se confirmó esta pregunta
    setPicked(choice);
  }

  function handleConfirm() {
    if (question.kind !== 'choice' || selected || !picked) return;
    const choice = picked;
    const isCorrect = choice === question.answer;
    setSelected(choice);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
      requeueMissed(question.itemId);
    }
    if (!readOnly) {
      ensureSession();
      startTransition(() => {
        void submitAnswer(unitId, question.itemId, isCorrect);
      });
    }
  }

  function fillPick(tile: Tile) {
    if (fillChecked) return;
    setFillBank((b) => b.filter((t) => t.key !== tile.key));
    setFillAnswer((a) => [...a, tile]);
  }

  function fillUnpick(tile: Tile) {
    if (fillChecked) return;
    setFillAnswer((a) => a.filter((t) => t.key !== tile.key));
    setFillBank((b) => [...b, tile]);
  }

  function handleFillCheck() {
    if (question.kind !== 'fill-blank' || fillChecked) return;
    const built = fillAnswer.map((t) => t.text).join(question.joiner);
    const isCorrect = built === question.answer;
    setFillChecked(true);
    setFillCorrect(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
      requeueMissed(question.itemId);
    }
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
    const isLast = index + 1 >= queue.length;
    const next = queue[index + 1];
    setPicked(null);
    setSelected(null);
    setFillAnswer([]);
    setFillChecked(false);
    setFillCorrect(false);
    setFillBank(next?.kind === 'fill-blank' ? tilesOf(next) : []);
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    if (readOnly) {
      setFinished(true);
      return;
    }
    const finalCorrect = correctCount;
    const finalTotal = queue.length;
    startTransition(async () => {
      // Si el usuario contesta más rápido que lo que tarda en resolver
      // beginSession(), se espera acá en vez de perder el cierre.
      const sessionId = await sessionIdPromise.current;
      if (sessionId === null || sessionId === undefined) return;
      const result = await endSession(sessionId, unitId, finalCorrect, finalTotal);
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
              {correctCount} de {queue.length}
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
              {correctCount} de {queue.length}
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
    <div className="space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <Progress value={((index + (revealed ? 1 : 0)) / queue.length) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{queue.length}
        </span>
      </div>

      {readOnly && (
        <p className="text-center text-xs text-muted-foreground">
          Repaso libre — esto no cambia tu progreso.
        </p>
      )}

      <p className="text-sm font-medium text-muted-foreground">
        {question.kind === 'choice' ? 'Elegí la respuesta correcta' : 'Armá la respuesta con las piezas'}
      </p>

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
        </CardContent>
      </Card>

      {question.kind === 'choice' ? (
        <div className="flex flex-col gap-2.5 lg:gap-3">
          {question.choices.map((choice, i) => {
            const isPicked = picked === choice;
            const isSelected = selected === choice;
            const isAnswer = choice === question.answer;
            const reading = question.choiceReadings?.[choice];

            return (
              <button
                key={choice}
                type="button"
                disabled={revealed}
                onClick={() => handlePick(choice)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors lg:py-4',
                  'disabled:cursor-default',
                  !revealed && !isPicked && 'border-border hover:bg-muted/50',
                  !revealed && isPicked && 'border-primary bg-primary/10',
                  revealed && isAnswer && 'border-accent-foreground bg-accent text-accent-foreground',
                  revealed && isSelected && !isAnswer && 'border-destructive bg-destructive/10 text-destructive',
                  revealed && !isAnswer && !isSelected && 'border-border opacity-50',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold lg:size-7 lg:text-sm',
                    !revealed && !isPicked && 'border-muted-foreground/40 text-muted-foreground',
                    !revealed && isPicked && 'border-primary bg-primary text-primary-foreground',
                    revealed && isAnswer && 'border-accent-foreground bg-accent-foreground text-accent',
                    revealed && isSelected && !isAnswer && 'border-destructive bg-destructive text-white',
                    revealed && !isAnswer && !isSelected && 'border-muted-foreground/30 text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="text-base lg:text-lg">{choice}</span>
                  {reading && reading !== choice && (
                    <span className="ml-2 text-xs font-normal opacity-70 lg:text-sm">{reading}</span>
                  )}
                </span>
                {revealed && isAnswer && <Check className="size-5 shrink-0" />}
                {revealed && isSelected && !isAnswer && <X className="size-5 shrink-0" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex min-h-14 w-full flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4">
            {fillAnswer.length === 0 && (
              <span className="text-sm text-muted-foreground">Tocá las piezas en orden</span>
            )}
            {fillAnswer.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => fillUnpick(tile)}
                disabled={fillChecked}
                className="jp rounded-lg border-2 border-primary bg-primary/10 px-3 py-2 text-base lg:text-lg disabled:cursor-default"
              >
                {tile.text}
              </button>
            ))}
          </div>

          {fillChecked && (
            <div
              className={cn(
                'rounded-lg border-2 p-3 text-center text-sm',
                fillCorrect
                  ? 'border-accent-foreground bg-accent text-accent-foreground'
                  : 'border-destructive bg-destructive/10 text-destructive',
              )}
            >
              {question.answer}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {fillBank.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => fillPick(tile)}
                disabled={fillChecked}
                className="jp rounded-lg border-2 border-border px-3 py-2 text-base transition-colors hover:bg-muted/50 disabled:cursor-default disabled:opacity-40 lg:text-lg"
              >
                {tile.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {revealed && explainGrammar && explanation !== null && (
        <p className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          {explanation}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-6 py-4 lg:max-w-2xl">
          {revealed && explainGrammar && explanation === null && (
            <Button variant="secondary" onClick={handleExplain} disabled={isExplaining}>
              {isExplaining ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 size-4" />
              )}
              {isExplaining ? 'Pensando...' : '¿Por qué?'}
            </Button>
          )}
          {revealed ? (
            <Button className="flex-1" size="lg" onClick={handleContinue}>
              Continuar
            </Button>
          ) : question.kind === 'choice' ? (
            <Button className="flex-1" size="lg" onClick={handleConfirm} disabled={!picked}>
              Comprobar
            </Button>
          ) : (
            <Button
              className="flex-1"
              size="lg"
              onClick={handleFillCheck}
              disabled={fillAnswer.length === 0}
            >
              Comprobar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
