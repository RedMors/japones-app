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
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

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

export default async function CaracteresPage() {
  const dict = getDictionary(await getLanguage());
  const progress = getKanaProgressMap();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'nav.characters')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(dict, 'caracteres.subtitle')}</p>

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
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t(dict, 'caracteres.practiceInSentences')}
        </h2>
        <div className="mt-3 space-y-3">
          {KANA_ROW_PRACTICE.map((row) => (
            <Link key={row.id} href={`/caracteres/practicar/${row.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-4 py-4">
                  <span className="jp text-xl">{row.chars}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {t(dict, 'caracteres.rowTitle', {
                        kind: row.kind === 'hiragana' ? 'Hiragana' : 'Katakana',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(dict, 'caracteres.readAndListen', { count: row.sentences.length })}
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
