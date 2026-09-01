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
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

export default async function Home() {
  const dict = getDictionary(await getLanguage());
  const status = await getStatus();

  if (!status.connected) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'progreso.title')}</h1>
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>{t(dict, 'anki.notConnected')}</AlertTitle>
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
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'progreso.title')}</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {t(dict, 'progreso.streakLabel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{streak}</p>
            <p className="text-xs text-muted-foreground">{t(dict, 'anki.streakDaysSuffix')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {t(dict, 'anki.last30Days')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{totalReviews30d}</p>
            <p className="text-xs text-muted-foreground">{t(dict, 'anki.reviewsLabel')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {t(dict, 'anki.vocabLabel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{knownVocab}</p>
            <p className="text-xs text-muted-foreground">
              {syncedAt ? t(dict, 'anki.synced') : t(dict, 'anki.notSynced')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {t(dict, 'anki.reviewTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={reviews} label={t(dict, 'anki.reviewsLabel')} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {t(dict, 'anki.decksTitle', { days: MATURE_INTERVAL_DAYS })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {decks
            .filter((d) => d.total > 0)
            .map((d) => (
              <div key={d.deckName} className="flex items-center justify-between text-sm">
                <span>{d.deckName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t(dict, 'anki.cardsCount', { count: d.total })}</Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    {t(dict, 'anki.masteredCount', { count: d.mature })}
                  </Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </main>
  );
}
