import {
  Flame,
  Target,
  Trophy,
  Zap,
  PartyPopper,
  Sparkles,
  Pickaxe,
  BookOpen,
  Mic,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ActivityHeatmap } from '@/components/activity-heatmap';
import { getActivityByDay, computeStudyStreak, getActivityTotals } from '@/lib/study-log';
import { getGoal, getGoalProgress } from '@/lib/curriculum/progress';

export const dynamic = 'force-dynamic';

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

/** Mensaje especial en los hitos de racha — el número solo ya lo dice todo,
 *  pero un cartel de "¡7 días!" se siente mucho más como un logro. */
const STREAK_MILESTONES = [
  { days: 100, icon: Trophy, label: '¡Racha de 100 días! Leyenda.' },
  { days: 30, icon: Trophy, label: '¡Un mes seguido! Impresionante.' },
  { days: 14, icon: Zap, label: '¡Dos semanas de racha!' },
  { days: 7, icon: PartyPopper, label: '¡Una semana seguida!' },
  { days: 3, icon: Sparkles, label: '¡Ya llevás 3 días, seguí así!' },
] as const;

function streakMilestone(streak: number): { icon: LucideIcon; label: string } | null {
  return STREAK_MILESTONES.find((m) => streak >= m.days) ?? null;
}

/** Un color de la paleta de charts por actividad — a color propio cada una,
 *  en vez de todas grises, así la tarjeta no queda plana en el estado vacío. */
const ACTIVITY_LABEL = {
  mining: { icon: Pickaxe, label: 'Minado', color: 'text-chart-1' },
  curriculum: { icon: BookOpen, label: 'Lecciones', color: 'text-chart-2' },
  speaking: { icon: Mic, label: 'Habla', color: 'text-chart-3' },
  anki_review: { icon: Layers, label: 'Repasos', color: 'text-chart-4' },
} as const;

export default async function ProgresoPage() {
  const byDay = getActivityByDay(126);
  const streak = computeStudyStreak(byDay);
  const totals = getActivityTotals();
  const totalActivities = totals.mining + totals.curriculum + totals.speaking + totals.anki_review;
  const milestone = streakMilestone(streak);
  const goal = getGoal();
  const goalProgress = goal ? getGoalProgress(goal.level) : null;
  const goalPct = goalProgress && goalProgress.total > 0
    ? Math.round((goalProgress.mastered / goalProgress.total) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Tu progreso</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Todo lo que hiciste para aprender japonés, en un solo lugar.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Racha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1.5 text-3xl font-semibold tabular-nums">
              {streak > 0 && <Flame className="size-6 shrink-0 text-accent-foreground" />}
              {streak}
            </p>
            <p className="text-xs text-muted-foreground">días seguidos estudiando</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Actividades totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{totalActivities}</p>
            <p className="text-xs text-muted-foreground">desde que arrancaste</p>
          </CardContent>
        </Card>
      </div>

      {milestone && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-accent-foreground/30 bg-accent p-4 text-accent-foreground">
          <milestone.icon className="size-6 shrink-0" />
          <p className="text-sm font-medium">{milestone.label}</p>
        </div>
      )}

      {goal && goalProgress && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
              <Target className="size-4 shrink-0" /> Meta: JLPT {goal.level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold tabular-nums">{goalPct}%</p>
              <p className="text-xs text-muted-foreground">
                {goalProgress.mastered}/{goalProgress.total} dominados
              </p>
            </div>
            <Progress value={goalPct} className="mt-2" />
            {goal.targetDate && (
              <p className="mt-2 text-xs text-muted-foreground">
                {(() => {
                  const days = daysUntil(goal.targetDate);
                  if (days > 0) return `Faltan ${days} días para tu fecha objetivo.`;
                  if (days === 0) return '¡Tu fecha objetivo es hoy!';
                  return `Tu fecha objetivo pasó hace ${Math.abs(days)} días — ajustala en Ajustes si hace falta.`;
                })()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Últimos ~4 meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={byDay} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Por tipo de actividad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(ACTIVITY_LABEL) as (keyof typeof ACTIVITY_LABEL)[]).map((key) => {
            const Icon = ACTIVITY_LABEL[key].icon;
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Icon className={cn('size-4 shrink-0', ACTIVITY_LABEL[key].color)} />
                  {ACTIVITY_LABEL[key].label}
                </span>
                <span className="tabular-nums text-muted-foreground">{totals[key]}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </main>
  );
}
