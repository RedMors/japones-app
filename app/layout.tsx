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
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Nav />
          {children}
          <TeacherWidget keyConfigured={isOpenRouterKeyConfigured()} />
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
