import { isOpenRouterKeyConfigured, getConfiguredModel } from '@/lib/settings';
import { getGoal } from '@/lib/curriculum/progress';
import { SettingsForm } from '@/components/settings/settings-form';
import { GoalForm } from '@/components/settings/goal-form';
import { saveSettings, saveGoal } from './actions';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

// Lee .env.local en cada request, no al build — sin esto Next podría
// prerenderizar con el estado de la primera vez que corrió.
export const dynamic = 'force-dynamic';

export default async function AjustesPage() {
  const dict = getDictionary(await getLanguage());
  const goal = getGoal();

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'ajustes.title')}</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">{t(dict, 'ajustes.goalSectionTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(dict, 'ajustes.goalBodyPrefix')}{' '}
          <a href="/progreso" className="underline">
            {t(dict, 'nav.progress')}
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
        <h2 className="text-sm font-semibold">{t(dict, 'ajustes.aiSectionTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t(dict, 'ajustes.aiSectionBody')}</p>
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
