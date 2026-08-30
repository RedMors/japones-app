import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { SCENE_THEMES } from '@/lib/curriculum/scenes-data';

export default function TemasPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Temas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Frases hechas por escena — escuchá y armá la oración, sin ver el texto primero.
      </p>

      <div className="mt-8 space-y-2">
        {SCENE_THEMES.map((theme) => (
          <Link key={theme.id} href={`/temas/${theme.id}`}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardContent className="flex items-center gap-4 py-4">
                <span className="text-2xl">{theme.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{theme.title}</p>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
