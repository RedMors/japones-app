import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  HIRAGANA,
  KATAKANA,
  HIRAGANA_AVANZADO,
  KATAKANA_AVANZADO,
  type KanaChar,
} from '@/lib/curriculum/kana-data';
import { getKanaProgressMap, type KanaCharStatus } from '@/lib/curriculum/progress';
import { KanaBoard, type KanaCell } from '@/components/curriculum/kana-board';
import { KANA_ROW_PRACTICE } from '@/lib/curriculum/kana-sentences';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

function toCells(chars: KanaChar[], progress: Map<string, KanaCharStatus>): KanaCell[] {
  return chars.map((c) => ({
    id: c.id,
    char: c.char,
    romaji: c.romaji,
    row: c.row,
    status: progress.get(c.id) ?? 'new',
  }));
}

export default function CaracteresPage() {
  const progress = getKanaProgressMap();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Caracteres</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Todo el hiragana y katakana de un vistazo, con tu progreso real — sin esperar a
        terminar una lección para ver dónde estás parado.
      </p>

      <div className="mt-8">
        <KanaBoard
          data={{
            hiragana: {
              basic: toCells(HIRAGANA, progress),
              advanced: toCells(HIRAGANA_AVANZADO, progress),
            },
            katakana: {
              basic: toCells(KATAKANA, progress),
              advanced: toCells(KATAKANA_AVANZADO, progress),
            },
          }}
        />
      </div>

      {/* Piloto: solo la fila さ/サ tiene oraciones curadas todavía — no
          expandir a las demás filas sin que el usuario confirme que el
          formato funciona. */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-muted-foreground">Practicar en oraciones</h2>
        <div className="mt-3 space-y-2">
          {KANA_ROW_PRACTICE.map((row) => (
            <Link key={row.id} href={`/caracteres/practicar/${row.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-4 py-4">
                  <span className="jp text-xl">{row.chars}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {row.kind === 'hiragana' ? 'Hiragana' : 'Katakana'} en oraciones cortas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Leé y escuchá {row.sentences.length} ejemplos reales con estos caracteres.
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
