import type { DayActivity } from '@/lib/study-log';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

const WEEKS = 18; // ~4 meses, estilo GitHub

function levelFor(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (max <= 1) return 4;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

const LEVEL_CLASS = [
  'bg-muted',
  'bg-accent/40',
  'bg-accent/70',
  'bg-accent',
  'bg-primary',
] as const;

export async function ActivityHeatmap({ data }: { data: DayActivity[] }) {
  const dict = getDictionary(await getLanguage());
  const byDate = new Map(data.map((d) => [d.date, d.count]));
  const max = Math.max(1, ...data.map((d) => d.count));

  const today = new Date();
  const totalDays = WEEKS * 7;
  const start = new Date(today);
  start.setDate(start.getDate() - totalDays + 1);
  // Alinear al domingo anterior para que las columnas sean semanas reales.
  start.setDate(start.getDate() - start.getDay());

  const weeks: { date: string; count: number }[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < WEEKS + 1; w++) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: iso, count: byDate.get(iso) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {weeks.map((week, i) => (
        <div key={i} className="flex flex-col gap-1">
          {week.map((day) => {
            const inFuture = new Date(day.date) > today;
            return (
              <div
                key={day.date}
                title={t(dict, 'heatmap.tooltip', { date: day.date, count: day.count })}
                className={`size-3 rounded-sm ${
                  inFuture ? 'bg-transparent' : LEVEL_CLASS[levelFor(day.count, max)]
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
