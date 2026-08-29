import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WordChip } from './word-chip';
import type { MinedWordRow } from '@/lib/miner';
import type { addWordToAnki, skipWord } from '@/app/miner/actions';

type Props = {
  sentence: string;
  startMs: number | null;
  words: MinedWordRow[];
  addAction: typeof addWordToAnki;
  skipAction: typeof skipWord;
};

function formatTimestamp(ms: number | null): string | null {
  if (ms === null) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Una card por oración. La cantidad de palabras nuevas es la señal de qué
 * tan aprendible es la línea ahora mismo: una sola es la oportunidad ideal.
 */
export function SentenceCard({ sentence, startMs, words, addAction, skipAction }: Props) {
  const timestamp = formatTimestamp(startMs);
  const pending = words.filter((w) => w.status === 'new').length;

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <p className="jp flex-1 text-lg">{sentence}</p>
          <div className="flex shrink-0 items-center gap-2">
            {timestamp && (
              <span className="text-xs tabular-nums text-muted-foreground">{timestamp}</span>
            )}
            {pending === 1 && (
              <Badge className="bg-accent text-accent-foreground">ideal</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {words.map((word) => (
            <WordChip key={word.id} word={word} addAction={addAction} skipAction={skipAction} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
