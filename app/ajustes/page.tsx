import { isOpenRouterKeyConfigured, getConfiguredModel } from '@/lib/settings';
import { getGoal } from '@/lib/curriculum/progress';
import { SettingsForm } from '@/components/settings/settings-form';
import { GoalForm } from '@/components/settings/goal-form';
import { saveSettings, saveGoal } from './actions';

// Lee .env.local en cada request, no al build — sin esto Next podría
// prerenderizar con el estado de la primera vez que corrió.
export const dynamic = 'force-dynamic';

export default function AjustesPage() {
  const goal = getGoal();

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">Meta JLPT</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elegí a qué nivel querés llegar. Lo vas a ver reflejado en{' '}
          <a href="/progreso" className="underline">
            Progreso
          </a>
          .
        </p>
        <div className="mt-4">
          <GoalForm
            currentLevel={goal?.level ?? null}
            currentDate={goal?.targetDate ?? null}
            saveGoal={saveGoal}
          />
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="text-sm font-semibold">Gramática con IA</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configuración de la explicación de gramática vía IA (OpenRouter). El resto de la app
          funciona 100% local, sin esto.
        </p>
        <div className="mt-4">
          <SettingsForm
            keyConfigured={isOpenRouterKeyConfigured()}
            currentModel={getConfiguredModel()}
            saveSettings={saveSettings}
          />
        </div>
      </section>
    </main>
  );
}
