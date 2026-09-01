import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

export async function LockedUnit({ title }: { title: string }) {
  const dict = getDictionary(await getLanguage());
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Alert>
        <Lock className="size-4" />
        <AlertTitle>{t(dict, 'lockedUnit.title', { title })}</AlertTitle>
        <AlertDescription>
          {t(dict, 'lockedUnit.body')}{' '}
          <Link href="/" className="underline underline-offset-2">
            {t(dict, 'session.back')}
          </Link>
        </AlertDescription>
      </Alert>
    </main>
  );
}
