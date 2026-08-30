import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

const ACTIVITY_LABEL = {
  mining: { emoji: '⛏️', label: 'Minado' },
  curriculum: { emoji: '📚', label: 'Lecciones' },
  speaking: { emoji: '🗣️', label: 'Habla' },
  anki_review: { emoji: '🎴', label: 'Repasos' },
} as const;

export default async function ProgresoPage() {
  const byDay = getActivityByDay(126);
  const streak = computeStudyStreak(byDay);
  const totals = getActivityTotals();
  const totalActivities = totals.mining + totals.curriculum + totals.anki_review;
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
            <p className="text-3xl font-semibold tabular-nums">
              {streak > 0 ? `🔥 ${streak}` : streak}
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

      {goal && goalProgress && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              🎯 Meta: JLPT {goal.level}
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
          {(Object.keys(ACTIVITY_LABEL) as (keyof typeof ACTIVITY_LABEL)[]).map((key) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span>
                {ACTIVITY_LABEL[key].emoji} {ACTIVITY_LABEL[key].label}
              </span>
              <span className="tabular-nums text-muted-foreground">{totals[key]}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
