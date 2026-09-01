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

  'teacher.title': 'Profesor',
  'teacher.emptyHint': 'Preguntame lo que quieras, sin cortar lo que estás haciendo.',
  'teacher.suggestion1': '¿Cuándo uso は en vez de が?',
  'teacher.suggestion2': 'です vs だ, ¿cuál es la diferencia?',
  'teacher.thinking': 'Pensando...',
  'teacher.placeholder': 'Escribí tu pregunta...',
  'teacher.fabTitle': 'Profesor (preguntas rápidas)',

  'kana.loading': 'Cargando...',
  'kana.practicedSentence': (v) => `Practicaste ${v.chars} en oraciones cortas.`,
  'kana.anotherSession': 'Otra sesión',
  'kana.listenAndTap': 'Escuchá y tocá las fichas en orden — cada una también suena sola',
  'kana.hideRomaji': 'Ocultar romaji',
  'kana.showRomaji': 'Mostrar romaji',
  'kana.listenSentence': 'Escuchar la oración',
  'kana.tapInOrder': 'Tocá las fichas en orden',
  'kana.youBuilt': (v) => `Armaste: ${v.text}`,
  'kana.finish': 'Terminar',
  'kana.next': 'Siguiente',

  'wordBuilder.listenAndBuild': 'Escuchá y armá la oración',
  'wordBuilder.tapWordsInOrder': 'Tocá las palabras en orden',

  'imageQuiz.whichImage': (v) => `¿Cuál de estas imágenes es "${v.reading}"?`,
  'imageQuiz.noImage': 'sin imagen',

  'ajustes.title': 'Ajustes',
  'ajustes.goalSectionTitle': 'Meta JLPT',
  'ajustes.goalBodyPrefix': 'Elegí a qué nivel querés llegar. Lo vas a ver reflejado en',
  'ajustes.aiSectionTitle': 'Gramática con IA',
  'ajustes.aiSectionBody':
    'Configuración de la explicación de gramática vía IA (OpenRouter). El resto de la app funciona 100% local, sin esto.',

  'settingsForm.apiKeyLabel': 'API key de OpenRouter',
  'settingsForm.apiKeyPlaceholderConfigured': 'Ya configurada — dejar vacío para no cambiarla',
  'settingsForm.apiKeyHelp1': 'Se guarda en',
  'settingsForm.apiKeyHelp2':
    ', nunca sale de tu máquina ni se sube a git. Se usa solo para el botón "explicar con IA" en las unidades de gramática.',
  'settingsForm.modelLabel': 'Modelo',
  'settingsForm.modelHelpPrefix': 'Id de modelo de OpenRouter. Ver lista y precios en',
  'settingsForm.saving': 'Guardando...',
  'settingsForm.save': 'Guardar',
  'settingsForm.nothingToSave': 'Nada para guardar',
  'settingsForm.saved': 'Guardado',

  'goalForm.levelLabel': 'Nivel que quiero alcanzar',
  'goalForm.dateLabel': 'Fecha objetivo (opcional)',
  'goalForm.dateHelp':
    'Si la ponés, el dashboard de Progreso te muestra cuánto te falta para llegar a tiempo.',
  'goalForm.saveGoal': 'Guardar meta',
  'goalForm.toast': 'Meta guardada — ¡vamos por eso!',
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

  'teacher.title': 'Teacher',
  'teacher.emptyHint': 'Ask me anything, without interrupting what you’re doing.',
  'teacher.suggestion1': 'When do I use は instead of が?',
  'teacher.suggestion2': 'です vs だ, what’s the difference?',
  'teacher.thinking': 'Thinking...',
  'teacher.placeholder': 'Type your question...',
  'teacher.fabTitle': 'Teacher (quick questions)',

  'kana.loading': 'Loading...',
  'kana.practicedSentence': (v) => `You practiced ${v.chars} in short sentences.`,
  'kana.anotherSession': 'Another session',
  'kana.listenAndTap': 'Listen and tap the tiles in order — each one also plays on its own',
  'kana.hideRomaji': 'Hide romaji',
  'kana.showRomaji': 'Show romaji',
  'kana.listenSentence': 'Listen to the sentence',
  'kana.tapInOrder': 'Tap the tiles in order',
  'kana.youBuilt': (v) => `You built: ${v.text}`,
  'kana.finish': 'Finish',
  'kana.next': 'Next',

  'wordBuilder.listenAndBuild': 'Listen and build the sentence',
  'wordBuilder.tapWordsInOrder': 'Tap the words in order',

  'imageQuiz.whichImage': (v) => `Which of these images is "${v.reading}"?`,
  'imageQuiz.noImage': 'no image',

  'ajustes.title': 'Settings',
  'ajustes.goalSectionTitle': 'JLPT goal',
  'ajustes.goalBodyPrefix': 'Choose which level you want to reach. You’ll see it reflected in',
  'ajustes.aiSectionTitle': 'AI grammar',
  'ajustes.aiSectionBody':
    'Configuration for AI-powered grammar explanations (OpenRouter). The rest of the app works 100% locally without this.',

  'settingsForm.apiKeyLabel': 'OpenRouter API key',
  'settingsForm.apiKeyPlaceholderConfigured': 'Already configured — leave empty to keep it',
  'settingsForm.apiKeyHelp1': 'Saved in',
  'settingsForm.apiKeyHelp2':
    ', never leaves your machine or gets pushed to git. Used only for the "explain with AI" button in grammar units.',
  'settingsForm.modelLabel': 'Model',
  'settingsForm.modelHelpPrefix': 'OpenRouter model id. See list and pricing at',
  'settingsForm.saving': 'Saving...',
  'settingsForm.save': 'Save',
  'settingsForm.nothingToSave': 'Nothing to save',
  'settingsForm.saved': 'Saved',

  'goalForm.levelLabel': 'Level I want to reach',
  'goalForm.dateLabel': 'Target date (optional)',
  'goalForm.dateHelp': 'If you set it, the Progress dashboard shows how much is left to get there on time.',
  'goalForm.saveGoal': 'Save goal',
  'goalForm.toast': 'Goal saved — let’s go for it!',
};

const dictionaries: Record<Lang, Dict> = { es, en };

export function getDictionary(lang: Lang): Dict {
  return dictionaries[lang];
}
