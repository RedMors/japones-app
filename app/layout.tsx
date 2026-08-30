import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Nav } from '@/components/nav';
import { TeacherWidget } from '@/components/teacher-widget';
import { isOpenRouterKeyConfigured } from '@/lib/settings';
import './globals.css';

export const metadata: Metadata = {
  title: 'Japonés',
  description: 'Sentence mining desde anime + seguimiento de Anki. Todo local.',
};

// isOpenRouterKeyConfigured() lee .env.local en cada request, no al build —
// mismo motivo que app/ajustes/page.tsx: sin esto, guardar la key desde
// Ajustes no haría aparecer el widget hasta reiniciar el server.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="h-dvh overflow-hidden antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Nav fijo arriba, el resto scrollea en su propia región — así una
              pantalla que ya entra completa (ej. un ejercicio) nunca tiene ni
              un pixel de scroll de sobra, y una larga (ej. la lista de
              unidades) scrollea normal adentro de este contenedor. */}
          <div className="flex h-full flex-col">
            <Nav />
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
          <TeacherWidget keyConfigured={isOpenRouterKeyConfigured()} />
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
