import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

/** Ya repasaste todo lo que tocaba hoy en esta unidad. Sin culpa, solo volver. */
export async function NothingDue({
  title,
  unitId,
  canReview,
}: {
  title: string;
  unitId: string;
  canReview: boolean;
}) {
  const dict = getDictionary(await getLanguage());
  return (
    <main className="mx-auto max-w-xl space-y-4 px-6 py-16">
      <Alert className="border-accent bg-accent/40">
        <CircleCheck className="size-4 text-accent-foreground" />
        <AlertTitle>{t(dict, 'nothingDue.title', { title })}</AlertTitle>
        <AlertDescription>{t(dict, 'nothingDue.body')}</AlertDescription>
      </Alert>
      <div className="flex gap-2">
        {canReview && (
          <Button asChild variant="outline">
            <Link href={`/${unitId}?review=1`}>{t(dict, 'nothingDue.reviewAnyway')}</Link>
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link href="/">{t(dict, 'nothingDue.viewOtherUnits')}</Link>
        </Button>
      </div>
    </main>
  );
}
