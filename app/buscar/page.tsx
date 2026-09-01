import { SearchBox } from '@/components/search/search-box';
import { isDictReady } from '@/lib/dictionary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleAlert } from 'lucide-react';
import { search } from './actions';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

// Mismo motivo que en app/page.tsx: better-sqlite3 es síncrono y Next no lo
// detecta como dependencia dinámica, así que sin esto quedaría prerenderizada.
export const dynamic = 'force-dynamic';

export default async function BuscarPage() {
  const dict = getDictionary(await getLanguage());

  if (!isDictReady()) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'buscar.title')}</h1>
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>{t(dict, 'buscar.dictNotReady')}</AlertTitle>
          <AlertDescription>
            {t(dict, 'buscar.dictNotReadyPrefix')} <code>npm run build:jmdict</code>{' '}
            {t(dict, 'buscar.dictNotReadySuffix')}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'buscar.title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(dict, 'buscar.subtitle')}</p>
      <div className="mt-6">
        <SearchBox search={search} />
      </div>
    </main>
  );
}
