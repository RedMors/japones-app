import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/** Ya repasaste todo lo que tocaba hoy en esta unidad. Sin culpa, solo volver. */
export function NothingDue({
  title,
  unitId,
  canReview,
}: {
  title: string;
  unitId: string;
  canReview: boolean;
}) {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-6 py-16">
      <Alert className="border-accent bg-accent/40">
        <CircleCheck className="size-4 text-accent-foreground" />
        <AlertTitle>Nada para repasar en {title} por ahora</AlertTitle>
        <AlertDescription>
          Volvé más tarde, o repasá igual solo para chequear qué te acordás — no afecta tu
          progreso.
        </AlertDescription>
      </Alert>
      <div className="flex gap-2">
        {canReview && (
          <Button asChild variant="outline">
            <Link href={`/${unitId}?review=1`}>Repasar igual</Link>
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link href="/">Ver otras unidades</Link>
        </Button>
      </div>
    </main>
  );
}
