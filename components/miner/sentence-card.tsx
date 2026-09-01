'use client';

import { Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WordChip } from './word-chip';
import { FuriganaText } from '@/components/curriculum/furigana-text';
import { speakJapanese } from '@/lib/tts';
import type { MinedWordRow } from '@/lib/miner';
import type { addWordToAnki, skipWord } from '@/app/miner/actions';
import { useLanguage } from '@/components/language-provider';

type Props = {
  sentence: string;
  /** Misma oración, con furigana inline ("食べる[たべる]") para mostrar con FuriganaText. */
  furiganaSentence: string;
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
export function SentenceCard({
  sentence,
  furiganaSentence,
  startMs,
  words,
  addAction,
  skipAction,
}: Props) {
  const { t } = useLanguage();
  const timestamp = formatTimestamp(startMs);
  const pending = words.filter((w) => w.status === 'new').length;

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-1.5">
            <FuriganaText text={furiganaSentence} className="jp flex-1 text-lg leading-loose" />
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground"
              onClick={() => speakJapanese(sentence)}
              title={t('session.listen')}
            >
              <Volume2 className="size-4" />
            </Button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {timestamp && (
              <span className="text-xs tabular-nums text-muted-foreground">{timestamp}</span>
            )}
            {pending === 1 && (
              <Badge className="bg-accent text-accent-foreground">{t('sentenceCard.ideal')}</Badge>
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
