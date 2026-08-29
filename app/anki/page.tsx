import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendChart } from '@/components/trend-chart';
import {
  getStatus,
  getDeckStats,
  getReviewsByDay,
  computeStreak,
  MATURE_INTERVAL_DAYS,
} from '@/lib/anki-connect';
import { getKnownVocabCount, getKnownVocabSyncedAt } from '@/lib/miner';
import { CircleAlert } from 'lucide-react';

export default async function Home() {
  const status = await getStatus();

  if (!status.connected) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Progreso</h1>
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>Anki no está abierto</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const [decks, reviews] = await Promise.all([getDeckStats(), getReviewsByDay(30)]);
  const streak = computeStreak(reviews);
  const totalReviews30d = reviews.reduce((sum, d) => sum + d.reviews, 0);
  const knownVocab = getKnownVocabCount();
  const syncedAt = getKnownVocabSyncedAt();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Progreso</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Racha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{streak}</p>
            <p className="text-xs text-muted-foreground">días seguidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Últimos 30 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{totalReviews30d}</p>
            <p className="text-xs text-muted-foreground">repasos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Vocabulario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{knownVocab}</p>
            <p className="text-xs text-muted-foreground">
              {syncedAt ? 'sincronizado' : 'sin sincronizar'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Tendencia de repasos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={reviews} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Mazos ({MATURE_INTERVAL_DAYS}+ días = dominada)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {decks
            .filter((d) => d.total > 0)
            .map((d) => (
              <div key={d.deckName} className="flex items-center justify-between text-sm">
                <span>{d.deckName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{d.total} tarjetas</Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    {d.mature} dominadas
                  </Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </main>
  );
}
