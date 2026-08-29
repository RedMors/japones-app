'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, Volume2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { speakJapanese } from '@/lib/tts';
import type { MinedWordRow } from '@/lib/miner';
import type { addWordToAnki, skipWord } from '@/app/miner/actions';

type Props = {
  word: MinedWordRow;
  addAction: typeof addWordToAnki;
  skipAction: typeof skipWord;
};

/** Agregar a Anki, o descartar para siempre: cada una es un solo click. */
export function WordChip({ word, addAction, skipAction }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const done = word.status === 'added' || word.status === 'skipped';

  function handleAdd() {
    startTransition(async () => {
      const result = await addAction(word.id);
      if (result.ok) {
        toast.success(`${word.lemma} agregada a Anki`);
        router.refresh();
      } else {
        toast.error(`No se pudo agregar ${word.lemma}`, { description: result.error });
      }
    });
  }

  function handleSkip() {
    startTransition(async () => {
      await skipAction(word.id, word.lemma);
      toast(`${word.lemma} descartada`, {
        description: 'No va a volver a aparecer en otros episodios.',
      });
      router.refresh();
    });
  }

  if (word.status === 'added') {
    return (
      <Badge variant="secondary" className="gap-1 py-1.5 pl-2 pr-2.5">
        <Check className="size-3.5 text-accent-foreground" />
        <span className="jp">{word.lemma}</span>
        {word.reading && <span className="text-muted-foreground">{word.reading}</span>}
      </Badge>
    );
  }

  if (word.status === 'skipped') {
    return (
      <Badge variant="outline" className="py-1.5 pl-2 pr-2.5 text-muted-foreground line-through">
        <span className="jp">{word.lemma}</span>
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5',
        isPending && 'opacity-60',
      )}
    >
      <div className="flex flex-col leading-tight">
        <span className="jp text-base">{word.lemma}</span>
        <span className="text-xs text-muted-foreground">
          {word.reading ?? '?'} {word.meaning ? `· ${truncate(word.meaning, 40)}` : ''}
        </span>
      </div>
      <div className="ml-1 flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-muted-foreground"
          onClick={() => speakJapanese(word.reading || word.lemma)}
          title="Escuchar"
        >
          <Volume2 className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-muted-foreground hover:text-destructive"
          disabled={isPending || done}
          onClick={handleSkip}
          title="Descartar (no volver a mostrar)"
        >
          <X className="size-4" />
        </Button>
        <Button
          size="icon"
          className="size-7"
          disabled={isPending || done}
          onClick={handleAdd}
          title="Agregar a Anki"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
