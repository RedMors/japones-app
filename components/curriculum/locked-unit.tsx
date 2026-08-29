import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LockedUnit({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Alert>
        <Lock className="size-4" />
        <AlertTitle>{title} todavía está bloqueada</AlertTitle>
        <AlertDescription>
          Completá la unidad anterior primero.{' '}
          <Link href="/" className="underline underline-offset-2">
            Volver
          </Link>
        </AlertDescription>
      </Alert>
    </main>
  );
}
