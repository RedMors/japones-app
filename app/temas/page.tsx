import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { SCENE_THEMES } from '@/lib/curriculum/scenes-data';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

/** Un color de la paleta de charts por escena — mismo criterio que
 *  "Por tipo de actividad" en /progreso, para que la lista no quede
 *  monocromática. Ciclado por índice: agregar una escena nueva no rompe
 *  nada, solo repite color si hay más de 5. */
const CHIP_COLORS = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/15 text-chart-4',
  'bg-chart-5/15 text-chart-5',
];

export default async function TemasPage() {
  const dict = getDictionary(await getLanguage());
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'nav.themes')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(dict, 'temas.subtitle')}</p>

      <div className="mt-8 space-y-2">
        {SCENE_THEMES.map((theme, i) => (
          <Link key={theme.id} href={`/temas/${theme.id}`}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardContent className="flex items-center gap-4 py-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
                >
                  <theme.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{theme.title}</p>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
