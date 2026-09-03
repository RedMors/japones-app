'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { saveSettings } from '@/app/ajustes/actions';
import { useLanguage } from '@/components/language-provider';

type Props = {
  keyConfigured: boolean;
  currentModel?: string;
  saveSettings: typeof saveSettings;
};

// Modelos de texto verificados contra GET /api/v1/models de OpenRouter — no
// listar de memoria, la API cambia ids/deprecaciones seguido (ver el fix de
// google/gemini-2.0-flash-001, que dejó de existir). Actualizar esta lista
// implica re-verificar contra la API, no solo copiar nombres conocidos.
const RECOMMENDED_MODELS = [
  { id: 'google/gemini-2.5-flash', descriptionKey: 'settingsForm.modelDescFlash' },
  { id: 'google/gemini-2.5-flash-lite', descriptionKey: 'settingsForm.modelDescFlashLite' },
  { id: 'google/gemini-2.5-pro', descriptionKey: 'settingsForm.modelDescPro' },
  { id: 'anthropic/claude-3.5-haiku', descriptionKey: 'settingsForm.modelDescHaiku' },
  { id: 'openai/gpt-4o-mini', descriptionKey: 'settingsForm.modelDescGpt4oMini' },
] as const;

const CUSTOM_VALUE = '__custom__';

export function SettingsForm({ keyConfigured, currentModel, saveSettings }: Props) {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(currentModel ?? '');
  const isRecommended = RECOMMENDED_MODELS.some((m) => m.id === model);
  const [showCustomInput, setShowCustomInput] = useState(!!model && !isRecommended);
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
        <div className="flex items-center gap-2">
          <label htmlFor="openrouter-key" className="block text-sm font-medium">
            {t('settingsForm.apiKeyLabel')}
          </label>
          {keyConfigured && (
            <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              {t('settingsForm.apiKeyConfiguredBadge')}
            </Badge>
          )}
        </div>
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
        <label htmlFor="openrouter-model" className="block text-sm font-medium">
          {t('settingsForm.modelLabel')}
        </label>
        <Select
          value={showCustomInput ? CUSTOM_VALUE : model || undefined}
          onValueChange={(value) => {
            if (value === CUSTOM_VALUE) {
              setShowCustomInput(true);
              return;
            }
            setShowCustomInput(false);
            setModel(value);
          }}
        >
          <SelectTrigger id="openrouter-model" className="w-full">
            <SelectValue placeholder={t('settingsForm.modelSelectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {RECOMMENDED_MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.id} — {t(m.descriptionKey)}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_VALUE}>{t('settingsForm.modelCustomOption')}</SelectItem>
          </SelectContent>
        </Select>
        {showCustomInput && (
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="provider/model-id"
            className="mt-1.5"
          />
        )}
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
