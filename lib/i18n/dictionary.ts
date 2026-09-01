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

  'home.title': 'Aprender',
  'home.subtitle': 'Un paso a la vez, de lo más básico hacia arriba.',
  'unit.masteredOf': (v) => `${v.mastered}/${v.total} dominados`,
  'unit.seenSuffix': (v) => ` · ${v.seen}/${v.total} vistos`,
  'level.summary': (v) =>
    `${v.mastered}/${v.total} palabras · ${v.lessons} ${v.lessons === 1 ? 'lección' : 'lecciones'}`,

  'progreso.title': 'Tu progreso',
  'progreso.subtitle': 'Todo lo que hiciste para aprender japonés, en un solo lugar.',
  'progreso.streakLabel': 'Racha',
  'progreso.streakSuffix': (v) => (v.days === 1 ? 'día seguido estudiando' : 'días seguidos estudiando'),
  'progreso.totalActivitiesLabel': 'Actividades totales',
  'progreso.sinceStart': 'desde que arrancaste',
  'progreso.goalLabel': (v) => `Meta: JLPT ${v.level}`,
  'progreso.daysLeft': (v) =>
    v.days === 1 ? 'Falta 1 día para tu fecha objetivo.' : `Faltan ${v.days} días para tu fecha objetivo.`,
  'progreso.dueToday': '¡Tu fecha objetivo es hoy!',
  'progreso.overdue': (v) =>
    v.days === 1
      ? 'Tu fecha objetivo pasó hace 1 día — ajustala en Ajustes si hace falta.'
      : `Tu fecha objetivo pasó hace ${v.days} días — ajustala en Ajustes si hace falta.`,
  'progreso.last4Months': 'Últimos ~4 meses',
  'progreso.byActivityType': 'Por tipo de actividad',
  'progreso.milestone100': '¡Racha de 100 días! Leyenda.',
  'progreso.milestone30': '¡Un mes seguido! Impresionante.',
  'progreso.milestone14': '¡Dos semanas de racha!',
  'progreso.milestone7': '¡Una semana seguida!',
  'progreso.milestone3': '¡Ya llevás 3 días, seguí así!',
  'activity.mining': 'Minado',
  'activity.curriculum': 'Lecciones',
  'activity.speaking': 'Habla',
  'activity.anki_review': 'Repasos',

  'session.scoreOf': (v) => `${v.correct} de ${v.total}`,
  'session.freeReviewNote': 'Repaso libre — no afectó tu progreso.',
  'session.unitComplete': (v) => `¡${v.title} completa!`,
  'session.unitCompleteBody': 'Dominaste todo. La siguiente unidad ya está disponible.',
  'session.keepGoing': 'Seguí así, un poco más.',
  'session.back': 'Volver',
  'session.freeReviewBanner': 'Repaso libre — esto no cambia tu progreso.',
  'session.chooseAnswer': 'Elegí la respuesta correcta',
  'session.buildAnswer': 'Armá la respuesta con las piezas',
  'session.listen': 'Escuchar',
  'session.tapInOrder': 'Tocá las piezas en orden',
  'session.thinking': 'Pensando...',
  'session.why': '¿Por qué?',
  'session.continue': 'Continuar',
  'session.check': 'Comprobar',
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

  'home.title': 'Learn',
  'home.subtitle': 'One step at a time, from the basics up.',
  'unit.masteredOf': (v) => `${v.mastered}/${v.total} mastered`,
  'unit.seenSuffix': (v) => ` · ${v.seen}/${v.total} seen`,
  'level.summary': (v) =>
    `${v.mastered}/${v.total} words · ${v.lessons} ${v.lessons === 1 ? 'lesson' : 'lessons'}`,

  'progreso.title': 'Your progress',
  'progreso.subtitle': 'Everything you did to learn Japanese, in one place.',
  'progreso.streakLabel': 'Streak',
  'progreso.streakSuffix': (v) => (v.days === 1 ? 'day studying in a row' : 'days studying in a row'),
  'progreso.totalActivitiesLabel': 'Total activities',
  'progreso.sinceStart': 'since you started',
  'progreso.goalLabel': (v) => `Goal: JLPT ${v.level}`,
  'progreso.daysLeft': (v) =>
    v.days === 1 ? '1 day left until your target date.' : `${v.days} days left until your target date.`,
  'progreso.dueToday': 'Your target date is today!',
  'progreso.overdue': (v) =>
    v.days === 1
      ? 'Your target date passed 1 day ago — adjust it in Settings if needed.'
      : `Your target date passed ${v.days} days ago — adjust it in Settings if needed.`,
  'progreso.last4Months': 'Last ~4 months',
  'progreso.byActivityType': 'By activity type',
  'progreso.milestone100': '100-day streak! Legendary.',
  'progreso.milestone30': 'A full month in a row! Impressive.',
  'progreso.milestone14': 'Two weeks in a row!',
  'progreso.milestone7': 'A full week in a row!',
  'progreso.milestone3': "You're at 3 days, keep going!",
  'activity.mining': 'Mining',
  'activity.curriculum': 'Lessons',
  'activity.speaking': 'Speaking',
  'activity.anki_review': 'Reviews',

  'session.scoreOf': (v) => `${v.correct} of ${v.total}`,
  'session.freeReviewNote': 'Free review — this didn’t affect your progress.',
  'session.unitComplete': (v) => `${v.title} complete!`,
  'session.unitCompleteBody': 'You mastered it all. The next unit is now available.',
  'session.keepGoing': 'Keep going, a bit more.',
  'session.back': 'Back',
  'session.freeReviewBanner': 'Free review — this won’t change your progress.',
  'session.chooseAnswer': 'Choose the correct answer',
  'session.buildAnswer': 'Build the answer from the pieces',
  'session.listen': 'Listen',
  'session.tapInOrder': 'Tap the pieces in order',
  'session.thinking': 'Thinking...',
  'session.why': 'Why?',
  'session.continue': 'Continue',
  'session.check': 'Check',
};

const dictionaries: Record<Lang, Dict> = { es, en };

export function getDictionary(lang: Lang): Dict {
  return dictionaries[lang];
}
