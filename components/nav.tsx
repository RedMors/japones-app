'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  GraduationCap,
  Grid3x3,
  MessageSquareText,
  Mic,
  Pickaxe,
  Search,
  Layers,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/components/language-provider';

type NavItem = { href: string; labelKey: string; icon: LucideIcon };

// Demasiados links sueltos en una sola fila se atropellaban entre sí en
// pantallas normales (10 ítems no entran en max-w-3xl). Agrupados por
// función: "Practicar" son las formas de estudiar, "Herramientas" es todo
// lo que no es una lección en sí.
const PRACTICE_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'nav.learn', icon: GraduationCap },
  { href: '/caracteres', labelKey: 'nav.characters', icon: Grid3x3 },
  { href: '/temas', labelKey: 'nav.themes', icon: MessageSquareText },
  { href: '/hablar', labelKey: 'nav.speak', icon: Mic },
];

const TOOL_ITEMS: NavItem[] = [
  { href: '/miner', labelKey: 'nav.mineEpisode', icon: Pickaxe },
  { href: '/buscar', labelKey: 'nav.search', icon: Search },
  { href: '/anki', labelKey: 'nav.anki', icon: Layers },
  { href: '/ajustes', labelKey: 'nav.settings', icon: Settings },
];

function linkClass(active: boolean) {
  return cn(
    'text-sm transition-colors',
    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  );
}

function NavGroup({
  label,
  items,
  isActive,
  t,
}: {
  label: string;
  items: NavItem[];
  isActive: boolean;
  t: (key: string) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn('flex items-center gap-1 outline-none', linkClass(isActive))}>
        {label}
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} className="gap-2" asChild>
            <Link href={item.href}>
              <item.icon className="size-4" /> {t(item.labelKey)}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const inPractice = PRACTICE_ITEMS.some((i) => i.href === pathname);
  const inTools = TOOL_ITEMS.some((i) => i.href === pathname);

  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4">
        <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
          日本語
        </Link>
        <NavGroup label={t('nav.practiceGroup')} items={PRACTICE_ITEMS} isActive={inPractice} t={t} />
        <Link href="/progreso" className={linkClass(pathname === '/progreso')}>
          {t('nav.progress')}
        </Link>
        <NavGroup label={t('nav.toolsGroup')} items={TOOL_ITEMS} isActive={inTools} t={t} />
        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
