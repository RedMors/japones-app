import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Japonés',
  description: 'Sentence mining desde anime + seguimiento de Anki. Todo local.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <nav className="border-b border-border">
            <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4">
              <Link href="/" className="text-sm font-semibold tracking-tight">
                日本語
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Aprender
              </Link>
              <Link
                href="/caracteres"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Caracteres
              </Link>
              <Link
                href="/miner"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Minar episodio
              </Link>
              <Link
                href="/buscar"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Buscar
              </Link>
              <Link
                href="/hablar"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Hablar
              </Link>
              <Link href="/anki" className="text-sm text-muted-foreground hover:text-foreground">
                Anki
              </Link>
              <Link
                href="/progreso"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Progreso
              </Link>
              <Link
                href="/ajustes"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Ajustes
              </Link>
            </div>
          </nav>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
