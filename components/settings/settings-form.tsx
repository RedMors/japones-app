'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { saveSettings } from '@/app/ajustes/actions';

type Props = {
  keyConfigured: boolean;
  currentModel?: string;
  saveSettings: typeof saveSettings;
};

export function SettingsForm({ keyConfigured, currentModel, saveSettings }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(currentModel ?? '');
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!apiKey.trim() && !model.trim()) {
      toast('Nada para guardar');
      return;
    }
    startTransition(async () => {
      await saveSettings(apiKey, model);
      setApiKey('');
      toast('Guardado');
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="openrouter-key" className="text-sm font-medium">
          API key de OpenRouter
        </label>
        <Input
          id="openrouter-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={keyConfigured ? 'Ya configurada — dejar vacío para no cambiarla' : 'sk-or-...'}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Se guarda en <code>.env.local</code>, nunca sale de tu máquina ni se sube a git. Se usa
          solo para el botón &quot;explicar con IA&quot; en las unidades de gramática.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="openrouter-model" className="text-sm font-medium">
          Modelo
        </label>
        <Input
          id="openrouter-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="google/gemini-2.0-flash-001"
        />
        <p className="text-xs text-muted-foreground">
          Id de modelo de OpenRouter. Ver lista y precios en{' '}
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
        {isPending ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
}
