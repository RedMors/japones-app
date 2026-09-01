import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Toaster } from '@/components/ui/sonner';
import { Nav } from '@/components/nav';
import { TeacherWidget } from '@/components/teacher-widget';
import { isOpenRouterKeyConfigured } from '@/lib/settings';
import { getLanguage } from '@/lib/i18n/language';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  return lang === 'en'
    ? { title: 'Japanese', description: 'Sentence mining from anime + Anki tracking. All local.' }
    : { title: 'Japonés', description: 'Sentence mining desde anime + seguimiento de Anki. Todo local.' };
}

// isOpenRouterKeyConfigured() lee .env.local en cada request, no al build —
// mismo motivo que app/ajustes/page.tsx: sin esto, guardar la key desde
// Ajustes no haría aparecer el widget hasta reiniciar el server.
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLanguage();
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="h-dvh overflow-hidden antialiased">
        <LanguageProvider initialLang={lang}>
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
        </LanguageProvider>
      </body>
    </html>
  );
}
