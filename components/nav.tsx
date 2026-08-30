'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NavItem = { href: string; label: string };

// Demasiados links sueltos en una sola fila se atropellaban entre sí en
// pantallas normales (10 ítems no entran en max-w-3xl). Agrupados por
// función: "Practicar" son las formas de estudiar, "Herramientas" es todo
// lo que no es una lección en sí.
const PRACTICE_ITEMS: NavItem[] = [
  { href: '/', label: 'Aprender' },
  { href: '/caracteres', label: 'Caracteres' },
  { href: '/temas', label: 'Temas' },
  { href: '/hablar', label: 'Hablar' },
];

const TOOL_ITEMS: NavItem[] = [
  { href: '/miner', label: 'Minar episodio' },
  { href: '/buscar', label: 'Buscar' },
  { href: '/anki', label: 'Anki' },
  { href: '/ajustes', label: 'Ajustes' },
];

function linkClass(active: boolean) {
  return cn(
    'text-sm transition-colors',
    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  );
}

function NavGroup({ label, items, isActive }: { label: string; items: NavItem[]; isActive: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn('flex items-center gap-1 outline-none', linkClass(isActive))}>
        {label}
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Nav() {
  const pathname = usePathname();
  const inPractice = PRACTICE_ITEMS.some((i) => i.href === pathname);
  const inTools = TOOL_ITEMS.some((i) => i.href === pathname);

  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4">
        <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
          日本語
        </Link>
        <NavGroup label="Practicar" items={PRACTICE_ITEMS} isActive={inPractice} />
        <Link href="/progreso" className={linkClass(pathname === '/progreso')}>
          Progreso
        </Link>
        <NavGroup label="Herramientas" items={TOOL_ITEMS} isActive={inTools} />
      </div>
    </nav>
  );
}
