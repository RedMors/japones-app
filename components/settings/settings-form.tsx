'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { saveSettings } from '@/app/ajustes/actions';
import { useLanguage } from '@/components/language-provider';

type Props = {
  keyConfigured: boolean;
  currentModel?: string;
  saveSettings: typeof saveSettings;
};

export function SettingsForm({ keyConfigured, currentModel, saveSettings }: Props) {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(currentModel ?? '');
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!apiKey.trim() && !model.trim()) {
      toast(t('settingsForm.nothingToSave'));
      return;
    }
    startTransition(async () => {
      await saveSettings(apiKey, model);
      setApiKey('');
      toast(t('settingsForm.saved'));
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="openrouter-key" className="text-sm font-medium">
          {t('settingsForm.apiKeyLabel')}
        </label>
        <Input
          id="openrouter-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={keyConfigured ? t('settingsForm.apiKeyPlaceholderConfigured') : 'sk-or-...'}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          {t('settingsForm.apiKeyHelp1')} <code>.env.local</code>
          {t('settingsForm.apiKeyHelp2')}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="openrouter-model" className="text-sm font-medium">
          {t('settingsForm.modelLabel')}
        </label>
        <Input
          id="openrouter-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="google/gemini-2.0-flash-001"
        />
        <p className="text-xs text-muted-foreground">
          {t('settingsForm.modelHelpPrefix')}{' '}
          <a
            href="https://openrouter.ai/models"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            openrouter.ai/models
          </a>
          .
        </p>
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? t('settingsForm.saving') : t('settingsForm.save')}
      </Button>
    </div>
  );
}
