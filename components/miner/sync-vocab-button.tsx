'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { syncVocabFromAnki } from '@/app/miner/actions';

export function SyncVocabButton({
  action,
  syncedAt,
}: {
  action: typeof syncVocabFromAnki;
  syncedAt: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(`Vocabulario actualizado: ${result.count} palabras`);
        router.refresh();
      } else {
        toast.error('No pude sincronizar con Anki', { description: result.error });
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <RefreshCw className="size-3.5" />
        )}
        Actualizar vocabulario
      </Button>
      <span className="text-xs text-muted-foreground">
        {syncedAt ? `sync: ${syncedAt}` : 'nunca sincronizado'}
      </span>
    </div>
  );
}
