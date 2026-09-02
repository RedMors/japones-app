import Link from 'next/link';

// better-sqlite3 es síncrono: Next no detecta la dependencia de datos y sin
// esto la página quedaría prerenderizada estática con el progreso congelado
// al momento del build, en vez de leerlo en cada visita.
export const dynamic = 'force-dynamic';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { listUnitsWithStatus } from '@/lib/curriculum/progress';
import type { Unit } from '@/lib/curriculum/units';
import type { UnitStatus } from '@/lib/curriculum/progress';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t, type Dict, type Lang } from '@/lib/i18n/dictionary';

const LEVEL_LABEL: Record<string, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  N5: 'JLPT N5',
  N4: 'JLPT N4',
  N3: 'JLPT N3',
  N2: 'JLPT N2',
  N1: 'JLPT N1',
};

const LEVEL_ORDER = ['hiragana', 'katakana', 'N5', 'N4', 'N3', 'N2', 'N1'];

type UnitRow = Unit & { status: UnitStatus; masteredCount: number; seenCount: number };

function UnitCard({ unit, dict, lang }: { unit: UnitRow; dict: Dict; lang: Lang }) {
  const total = unit.items.length;
  const masteredPct = total > 0 ? Math.round((unit.masteredCount / total) * 100) : 0;
  const seenPct = total > 0 ? Math.round((unit.seenCount / total) * 100) : 0;
  const locked = unit.status === 'locked';

  const content = (
    <Card
      className={
        locked
          ? 'border-dashed opacity-45 shadow-none'
          : 'transition-colors hover:bg-muted/40'
      }
    >
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            locked ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground',
          )}
        >
          {unit.status === 'completed' ? (
            <CheckCircle2 className="size-4" />
          ) : locked ? (
            <Lock className="size-3.5" />
          ) : (
            <span className="text-xs font-semibold">{unit.order + 1}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{unit.title[lang]}</p>
          {/* Track claro = ya visto al menos una vez; barra sólida = dominado
              (5 aciertos espaciados). Sin el track claro, practicar 30 ítems
              nuevos se ve idéntico a no haber tocado nada — desalienta.
              bg-border (no bg-muted) para que el track se note incluso sin
              progreso: antes era casi invisible sobre el fondo oscuro. */}
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary/40"
              style={{ width: `${seenPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${masteredPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(dict, 'unit.masteredOf', { mastered: unit.masteredCount, total })}
            {unit.seenCount > unit.masteredCount &&
              t(dict, 'unit.seenSuffix', { seen: unit.seenCount, total })}
          </p>
        </div>
        {!locked && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
      </CardContent>
    </Card>
  );

  return locked ? <div>{content}</div> : <Link href={`/${unit.id}`}>{content}</Link>;
}

export default async function LearnHome() {
  const lang = await getLanguage();
  const dict = getDictionary(lang);
  const units = listUnitsWithStatus();

  const byLevel = new Map<string, UnitRow[]>();
  for (const unit of units) {
    if (!byLevel.has(unit.level)) byLevel.set(unit.level, []);
    byLevel.get(unit.level)!.push(unit);
  }

  const levels = LEVEL_ORDER.filter((l) => byLevel.has(l)).map((level) => {
    const levelUnits = byLevel.get(level)!;
    const mastered = levelUnits.reduce((s, u) => s + u.masteredCount, 0);
    const total = levelUnits.reduce((s, u) => s + u.items.length, 0);
    const completed = levelUnits.every((u) => u.status === 'completed');
    const started = levelUnits.some((u) => u.status !== 'locked');
    return { level, levelUnits, mastered, total, completed, started };
  });

  // El nivel "activo" es el primero que no está 100% completo — ese se abre
  // solo; el resto queda colapsado para no enterrar la pantalla en 400 filas.
  const activeIndex = levels.findIndex((l) => !l.completed);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'home.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(dict, 'home.subtitle')}</p>

      <Accordion
        type="single"
        collapsible
        defaultValue={activeIndex >= 0 ? levels[activeIndex].level : undefined}
        className="mt-8"
      >
        {levels.map(({ level, levelUnits, mastered, total, completed, started }) => (
          <AccordionItem key={level} value={level}>
            <AccordionTrigger className="text-base">
              <span className="flex flex-1 items-center justify-between pr-2">
                <span className="flex items-center gap-2">
                  {completed && <CheckCircle2 className="size-4 text-accent-foreground" />}
                  {!started && <Lock className="size-3.5 text-muted-foreground" />}
                  {LEVEL_LABEL[level] ?? level}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {t(dict, 'level.summary', { mastered, total, lessons: levelUnits.length })}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {levelUnits.map((unit) => (
                  <UnitCard key={unit.id} unit={unit} dict={dict} lang={lang} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
