import { isOpenRouterKeyConfigured, getConfiguredModel } from '@/lib/settings';
import { SettingsForm } from '@/components/settings/settings-form';
import { saveSettings } from './actions';

// Lee .env.local en cada request, no al build — sin esto Next podría
// prerenderizar con el estado de la primera vez que corrió.
export const dynamic = 'force-dynamic';

export default function AjustesPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Configuración de la explicación de gramática vía IA (OpenRouter). El resto de la app
        funciona 100% local, sin esto.
      </p>
      <div className="mt-6">
        <SettingsForm
          keyConfigured={isOpenRouterKeyConfigured()}
          currentModel={getConfiguredModel()}
          saveSettings={saveSettings}
        />
      </div>
    </main>
  );
}
