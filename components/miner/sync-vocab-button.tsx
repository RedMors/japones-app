'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { syncVocabFromAnki } from '@/app/miner/actions';
import { useLanguage } from '@/components/language-provider';

export function SyncVocabButton({
  action,
  syncedAt,
}: {
  action: typeof syncVocabFromAnki;
  syncedAt: string | null;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(t('syncVocab.updated', { count: result.count }));
        router.refresh();
      } else {
        toast.error(t('syncVocab.syncFailed'), { description: result.error });
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
        {t('syncVocab.updateVocab')}
      </Button>
      <span className="text-xs text-muted-foreground">
        {syncedAt ? t('syncVocab.syncedAt', { date: syncedAt }) : t('syncVocab.neverSynced')}
      </span>
    </div>
  );
}
