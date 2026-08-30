import { Card, CardContent } from '@/components/ui/card';
import { getSpeakingPracticeItems } from '@/lib/curriculum/progress';
import { SpeakingPractice } from '@/components/curriculum/speaking-practice';
import { logSpeakingSession } from './actions';

export const dynamic = 'force-dynamic';

const SESSION_SIZE = 10;

export default function HablarPage() {
  const items = getSpeakingPracticeItems(SESSION_SIZE);

  return (
    <main className="mx-auto max-w-xl px-6 py-16 lg:max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Práctica de habla</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pronunciá en voz alta lo que ya dominaste. Necesita micrófono y Chrome (o similar).
      </p>

      {items.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Todavía no dominaste ningún ítem para practicar. Completá una lección en{' '}
            <a href="/" className="underline">
              Aprender
            </a>{' '}
            primero — esto practica pronunciación de lo que ya sabés, no vocabulario nuevo.
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
