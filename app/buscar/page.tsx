import { SearchBox } from '@/components/search/search-box';
import { isDictReady } from '@/lib/dictionary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleAlert } from 'lucide-react';
import { search } from './actions';

// Mismo motivo que en app/page.tsx: better-sqlite3 es síncrono y Next no lo
// detecta como dependencia dinámica, así que sin esto quedaría prerenderizada.
export const dynamic = 'force-dynamic';

export default function BuscarPage() {
  if (!isDictReady()) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Buscar</h1>
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>Diccionario no generado</AlertTitle>
          <AlertDescription>
            Corré <code>npm run build:jmdict</code> primero.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Buscar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Palabra, lectura o significado. Con pronunciación.
      </p>
      <div className="mt-6">
        <SearchBox search={search} />
      </div>
    </main>
  );
}
