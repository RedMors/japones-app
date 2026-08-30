import {
  HIRAGANA,
  KATAKANA,
  HIRAGANA_AVANZADO,
  KATAKANA_AVANZADO,
  type KanaChar,
} from '@/lib/curriculum/kana-data';
import { getKanaProgressMap, type KanaCharStatus } from '@/lib/curriculum/progress';
import { KanaBoard, type KanaCell } from '@/components/curriculum/kana-board';

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
    </main>
  );
}
