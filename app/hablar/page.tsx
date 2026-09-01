import { Card, CardContent } from '@/components/ui/card';
import { getSpeakingPracticeItems } from '@/lib/curriculum/progress';
import { SpeakingPractice } from '@/components/curriculum/speaking-practice';
import { logSpeakingSession } from './actions';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

export const dynamic = 'force-dynamic';

const SESSION_SIZE = 10;

export default async function HablarPage() {
  const dict = getDictionary(await getLanguage());
  const items = getSpeakingPracticeItems(SESSION_SIZE);

  return (
    <main className="mx-auto max-w-xl px-6 py-16 lg:max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'hablar.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(dict, 'hablar.subtitle')}</p>

      {items.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t(dict, 'hablar.emptyPrefix')}{' '}
            <a href="/" className="underline">
              {t(dict, 'home.title')}
            </a>{' '}
            {t(dict, 'hablar.emptySuffix')}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8">
          <SpeakingPractice items={items} logSession={logSpeakingSession} />
        </div>
      )}
    </main>
  );
}
