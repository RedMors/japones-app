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
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t, type TranslationKey } from '@/lib/i18n/dictionary';

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
  { days: 100, icon: Trophy, key: 'progreso.milestone100' },
  { days: 30, icon: Trophy, key: 'progreso.milestone30' },
  { days: 14, icon: Zap, key: 'progreso.milestone14' },
  { days: 7, icon: PartyPopper, key: 'progreso.milestone7' },
  { days: 3, icon: Sparkles, key: 'progreso.milestone3' },
] as const;

function streakMilestone(streak: number): { icon: LucideIcon; key: TranslationKey } | null {
  return STREAK_MILESTONES.find((m) => streak >= m.days) ?? null;
}

/** Un color de la paleta de charts por actividad — a color propio cada una,
 *  en vez de todas grises, así la tarjeta no queda plana en el estado vacío. */
const ACTIVITY_LABEL = {
  mining: { icon: Pickaxe, key: 'activity.mining', color: 'text-chart-1' },
  curriculum: { icon: BookOpen, key: 'activity.curriculum', color: 'text-chart-2' },
  speaking: { icon: Mic, key: 'activity.speaking', color: 'text-chart-3' },
  anki_review: { icon: Layers, key: 'activity.anki_review', color: 'text-chart-4' },
} as const;

export default async function ProgresoPage() {
  const dict = getDictionary(await getLanguage());
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
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'progreso.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(dict, 'progreso.subtitle')}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {t(dict, 'progreso.streakLabel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1.5 text-3xl font-semibold tabular-nums">
              {streak > 0 && <Flame className="size-6 shrink-0 text-accent-foreground" />}
              {streak}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(dict, 'progreso.streakSuffix', { days: streak })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {t(dict, 'progreso.totalActivitiesLabel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{totalActivities}</p>
            <p className="text-xs text-muted-foreground">{t(dict, 'progreso.sinceStart')}</p>
          </CardContent>
        </Card>
      </div>

      {milestone && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-accent-foreground/30 bg-accent p-4 text-accent-foreground">
          <milestone.icon className="size-6 shrink-0" />
          <p className="text-sm font-medium">{t(dict, milestone.key)}</p>
        </div>
      )}

      {goal && goalProgress && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
              <Target className="size-4 shrink-0" /> {t(dict, 'progreso.goalLabel', { level: goal.level })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold tabular-nums">{goalPct}%</p>
              <p className="text-xs text-muted-foreground">
                {t(dict, 'unit.masteredOf', { mastered: goalProgress.mastered, total: goalProgress.total })}
              </p>
            </div>
            <Progress value={goalPct} className="mt-2" />
            {goal.targetDate && (
              <p className="mt-2 text-xs text-muted-foreground">
                {(() => {
                  const days = daysUntil(goal.targetDate);
                  if (days > 0) return t(dict, 'progreso.daysLeft', { days });
                  if (days === 0) return t(dict, 'progreso.dueToday');
                  return t(dict, 'progreso.overdue', { days: Math.abs(days) });
                })()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {t(dict, 'progreso.last4Months')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={byDay} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {t(dict, 'progreso.byActivityType')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(ACTIVITY_LABEL) as (keyof typeof ACTIVITY_LABEL)[]).map((key) => {
            const Icon = ACTIVITY_LABEL[key].icon;
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Icon className={cn('size-4 shrink-0', ACTIVITY_LABEL[key].color)} />
                  {t(dict, ACTIVITY_LABEL[key].key)}
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
