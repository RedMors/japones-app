'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { speakJapanese } from '@/lib/tts';
import type { KanaCharStatus } from '@/lib/curriculum/progress';

export type KanaCell = {
  id: string;
  char: string;
  romaji: string;
  row: string;
  status: KanaCharStatus;
};

type Kind = 'hiragana' | 'katakana';

type Props = {
  data: Record<Kind, { basic: KanaCell[]; advanced: KanaCell[] }>;
};

const STATUS_DOT: Record<KanaCharStatus, string> = {
  new: 'bg-muted-foreground/20',
  seen: 'bg-primary/60',
  mastered: 'bg-accent-foreground',
};

function groupByRow(cells: KanaCell[]): KanaCell[][] {
  const rows: KanaCell[][] = [];
  let current: KanaCell[] = [];
  let currentRow: string | null = null;
  for (const cell of cells) {
    if (cell.row !== currentRow) {
      if (current.length) rows.push(current);
      current = [];
      currentRow = cell.row;
    }
    current.push(cell);
  }
  if (current.length) rows.push(current);
  return rows;
}

function CharGrid({ cells }: { cells: KanaCell[] }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {cells.map((cell) => (
        <button
          key={cell.id}
          type="button"
          title={`${cell.char} — ${cell.romaji}`}
          onClick={() => speakJapanese(cell.char)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-xl border py-3 transition-colors hover:bg-muted/50',
            cell.status === 'mastered'
              ? 'border-accent-foreground/40 bg-accent hover:bg-accent'
              : 'border-border bg-card',
          )}
        >
          <span className="jp text-2xl sm:text-3xl">{cell.char}</span>
          <span className="text-[11px] text-muted-foreground">{cell.romaji}</span>
          <span className={cn('size-1.5 rounded-full', STATUS_DOT[cell.status])} />
        </button>
      ))}
    </div>
  );
}

function Section({
  title,
  unitId,
  cells,
}: {
  title: string;
  unitId: string;
  cells: KanaCell[];
}) {
  const mastered = cells.filter((c) => c.status === 'mastered').length;
  const complete = mastered === cells.length;
  const rows = groupByRow(cells);

  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          {title}
          {complete && <span title="¡Sección completa!">🏆</span>}
        </h2>
        <span
          className={cn(
            'text-xs tabular-nums',
            complete ? 'font-medium text-accent-foreground' : 'text-muted-foreground',
          )}
        >
          {mastered}/{cells.length} dominados
        </span>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {rows.map((row, i) => (
          <CharGrid key={i} cells={row} />
        ))}
      </div>
      {complete ? (
        <p className="mt-4 rounded-lg border border-accent-foreground/30 bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-foreground">
          🎉 ¡Dominaste todo {title.toLowerCase()}!
        </p>
      ) : (
        <Button asChild variant="secondary" className="mt-4 w-full">
          <Link href={`/${unitId}`}>Practicar</Link>
        </Button>
      )}
    </div>
  );
}

export function KanaBoard({ data }: Props) {
  const [tab, setTab] = useState<Kind>('hiragana');

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {(['hiragana', 'katakana'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors',
              tab === k
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {k === 'hiragana' ? 'Hiragana' : 'Katakana'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Section
          title="Básico"
          unitId={tab === 'hiragana' ? 'hiragana-basico' : 'katakana-basico'}
          cells={data[tab].basic}
        />
        <Section
          title="Dakuten y yōon"
          unitId={tab === 'hiragana' ? 'hiragana-avanzado' : 'katakana-avanzado'}
          cells={data[tab].advanced}
        />
      </div>
    </div>
  );
}
