import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3 y kuromoji son módulos nativos / cargan archivos de disco.
  // Sin esto el bundler los rompe (kuromoji pierde la ruta de su diccionario).
  serverExternalPackages: ['better-sqlite3', 'kuromoji'],
  // Next 16 genera AGENTS.md/CLAUDE.md solo; pisaría el CLAUDE.md propio del usuario.
  agentRules: false,
};

export default nextConfig;
