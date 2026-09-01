'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/components/language-provider';

const OPTIONS = [
  { value: 'light', labelKey: 'themeToggle.light', icon: Sun },
  { value: 'dark', labelKey: 'themeToggle.dark', icon: Moon },
  { value: 'system', labelKey: 'themeToggle.system', icon: Monitor },
] as const;

/**
 * `theme` (lo que el usuario eligió) difiere entre servidor y cliente hasta
 * que next-themes lee localStorage — mostrar el ícono real antes de montar
 * tira hydration mismatch. Con `mounted` en falso se renderiza un ícono
 * neutro (Monitor) que es igual en los dos lados.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const Icon = mounted ? current.icon : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          title={t('themeToggle.title')}
          aria-label={t('themeToggle.ariaLabel')}
          className={className}
        >
          <Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="gap-2"
            onClick={() => setTheme(option.value)}
          >
            <option.icon className="size-4" /> {t(option.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
