export type Lang = 'es' | 'en';

type Vars = Record<string, string | number>;
type Entry = string | ((vars: Vars) => string);
export type Dict = Record<string, Entry>;

export function t(dict: Dict, key: string, vars?: Vars): string {
  const entry = dict[key];
  if (entry === undefined) return key;
  if (typeof entry === 'function') return entry(vars ?? {});
  if (!vars) return entry;
  return entry.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name] ?? ''));
}

const es: Dict = {
  'nav.learn': 'Aprender',
  'nav.characters': 'Caracteres',
  'nav.themes': 'Temas',
  'nav.speak': 'Hablar',
  'nav.practiceGroup': 'Practicar',
  'nav.progress': 'Progreso',
  'nav.mineEpisode': 'Minar episodio',
  'nav.search': 'Buscar',
  'nav.anki': 'Anki',
  'nav.settings': 'Ajustes',
  'nav.toolsGroup': 'Herramientas',

  'themeToggle.light': 'Claro',
  'themeToggle.dark': 'Oscuro',
  'themeToggle.system': 'Sistema',
  'themeToggle.title': 'Tema',
  'themeToggle.ariaLabel': 'Cambiar tema',

  'languageToggle.title': 'Idioma',
  'languageToggle.ariaLabel': 'Cambiar idioma',
};

const en: Dict = {
  'nav.learn': 'Learn',
  'nav.characters': 'Characters',
  'nav.themes': 'Themes',
  'nav.speak': 'Speak',
  'nav.practiceGroup': 'Practice',
  'nav.progress': 'Progress',
  'nav.mineEpisode': 'Mine episode',
  'nav.search': 'Search',
  'nav.anki': 'Anki',
  'nav.settings': 'Settings',
  'nav.toolsGroup': 'Tools',

  'themeToggle.light': 'Light',
  'themeToggle.dark': 'Dark',
  'themeToggle.system': 'System',
  'themeToggle.title': 'Theme',
  'themeToggle.ariaLabel': 'Change theme',

  'languageToggle.title': 'Language',
  'languageToggle.ariaLabel': 'Change language',
};

const dictionaries: Record<Lang, Dict> = { es, en };

export function getDictionary(lang: Lang): Dict {
  return dictionaries[lang];
}
