export type Lang = 'es' | 'en';

type Vars = Record<string, string | number>;
type Entry = string | ((vars: Vars) => string);

const es = {
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

  'hablar.title': 'Práctica de habla',
  'hablar.subtitle': 'Pronunciá en voz alta lo que ya dominaste. Necesita micrófono y Chrome (o similar).',
  'hablar.emptyPrefix': 'Todavía no dominaste ningún ítem para practicar. Completá una lección en',
  'hablar.emptySuffix':
    'primero — esto practica pronunciación de lo que ya sabés, no vocabulario nuevo.',

  'speaking.micNotAllowed': 'Necesito permiso de micrófono.',
  'speaking.noSpeech': 'No escuché nada — probá de nuevo.',
  'speaking.genericError': 'Algo falló escuchando. Probá de nuevo.',
  'speaking.notSupported':
    'Tu navegador no soporta reconocimiento de voz (funciona en Chrome/Edge de escritorio). Probá desde ahí.',
  'speaking.excellentPronunciation': '¡Excelente pronunciación!',
  'speaking.keepPracticing': 'Seguí practicando, cada vez suena mejor.',
  'speaking.listenPronunciation': 'Escuchar cómo se pronuncia',
  'speaking.wellPronounced': '¡Bien pronunciado!',
  'speaking.notQuiteMatch': 'No coincide del todo',
  'speaking.heard': (v) => `Se entendió: "${v.text}"`,
  'speaking.expected': (v) => `Se esperaba: ${v.text}`,
  'speaking.listening': 'Escuchando...',
  'speaking.pronounce': 'Pronunciar',

  'buscar.title': 'Buscar',
  'buscar.dictNotReady': 'Diccionario no generado',
  'buscar.dictNotReadyPrefix': 'Corré',
  'buscar.dictNotReadySuffix': 'primero.',
  'buscar.subtitle': 'Palabra, lectura o significado. Con pronunciación.',

  'searchBox.placeholder': 'Buscar en japonés o en inglés — 食べる, taberu, eat…',
  'searchBox.noVoices': 'Tu navegador no tiene voces de pronunciación disponibles.',
  'searchBox.noResults': (v) => `Sin resultados para "${v.query}".`,

  'anki.notConnected': 'Anki no está abierto',
  'anki.streakDaysSuffix': 'días seguidos',
  'anki.last30Days': 'Últimos 30 días',
  'anki.reviewsLabel': 'repasos',
  'anki.vocabLabel': 'Vocabulario',
  'anki.synced': 'sincronizado',
  'anki.notSynced': 'sin sincronizar',
  'anki.reviewTrend': 'Tendencia de repasos',
  'anki.decksTitle': (v) => `Mazos (${v.days}+ días = dominada)`,
  'anki.cardsCount': (v) => `${v.count} tarjetas`,
  'anki.masteredCount': (v) => `${v.count} dominadas`,

  'heatmap.tooltip': (v) => `${v.date}: ${v.count} ${v.count === 1 ? 'actividad' : 'actividades'}`,

  'temas.subtitle': 'Frases hechas por escena — escuchá y armá la oración, sin ver el texto primero.',

  'sceneSession.natural': (v) => `¡Ya te sale natural en "${v.title}"!`,
  'sceneSession.keepPracticing': 'Seguí practicando esta escena.',

  'caracteres.subtitle':
    'Todo el hiragana y katakana de un vistazo, con tu progreso real — sin esperar a terminar una lección para ver dónde estás parado.',
  'caracteres.practiceInSentences': 'Practicar en oraciones',
  'caracteres.rowTitle': (v) => `${v.kind} en oraciones cortas`,
  'caracteres.readAndListen': (v) => `Leé y escuchá ${v.count} ejemplos reales con estos caracteres.`,
  'caracteres.inSentencesSuffix': 'en oraciones',

  'kanaBoard.sectionComplete': 'Sección completa',
  'kanaBoard.masteredAll': (v) => `¡Dominaste todo ${String(v.title).toLowerCase()}!`,
  'kanaBoard.practice': 'Practicar',
  'kanaBoard.basic': 'Básico',
  'kanaBoard.dakutenYoon': 'Dakuten y yōon',

  'nothingDue.title': (v) => `Nada para repasar en ${v.title} por ahora`,
  'nothingDue.body':
    'Volvé más tarde, o repasá igual solo para chequear qué te acordás — no afecta tu progreso.',
  'nothingDue.reviewAnyway': 'Repasar igual',
  'nothingDue.viewOtherUnits': 'Ver otras unidades',

  'lockedUnit.title': (v) => `${v.title} todavía está bloqueada`,
  'lockedUnit.body': 'Completá la unidad anterior primero.',

  'miner.cannotMineSuffix':
    ' Podés minar igual, pero no vas a poder agregar tarjetas ni actualizar tu vocabulario conocido hasta que lo abras.',
  'miner.processError': 'No pude procesar el archivo',
  'miner.minedEpisodes': (v) => `Episodios minados (${v.count})`,
  'miner.wordsCount': (v) => `${v.count} palabras`,
  'miner.alreadyMined': 'Este episodio ya estaba minado',
  'miner.learnedNewWords': (v) => `¡Aprendiste ${v.count} palabras nuevas!`,
  'miner.linesProcessed': (v) => `${v.count} líneas procesadas`,
  'miner.alreadyAddedToAnki': (v) => ` · ${v.count} ya agregadas a Anki`,
  'miner.noNewWords':
    'No encontré palabras nuevas en este episodio — ya conocés todo el vocabulario.',

  'srtDropzone.processing': 'Procesando episodio…',
  'srtDropzone.dropHere': 'Soltá un .srt o .ass acá',
  'srtDropzone.orClick':
    'o hacé click para elegirlo — sumá también el video/audio (selección múltiple) para clips de pronunciación',

  'sentenceCard.ideal': 'ideal',

  'wordChip.addedToAnki': (v) => `${v.lemma} agregada a Anki`,
  'wordChip.addFailed': (v) => `No se pudo agregar ${v.lemma}`,
  'wordChip.skipped': (v) => `${v.lemma} descartada`,
  'wordChip.skippedDesc': 'No va a volver a aparecer en otros episodios.',
  'wordChip.discardTitle': 'Descartar (no volver a mostrar)',
  'wordChip.addToAnki': 'Agregar a Anki',

  'syncVocab.updateVocab': 'Actualizar vocabulario',
  'syncVocab.syncedAt': (v) => `sync: ${v.date}`,
  'syncVocab.neverSynced': 'nunca sincronizado',
  'syncVocab.updated': (v) => `Vocabulario actualizado: ${v.count} palabras`,
  'syncVocab.syncFailed': 'No pude sincronizar con Anki',
} satisfies Record<string, Entry>;

export type TranslationKey = keyof typeof es;
export type Dict = Record<TranslationKey, Entry>;

export function t(dict: Dict, key: TranslationKey, vars?: Vars): string {
  const entry = dict[key];
  if (typeof entry === 'function') return entry(vars ?? {});
  if (!vars) return entry;
  return entry.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name] ?? ''));
}

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

  'hablar.title': 'Speaking practice',
  'hablar.subtitle': 'Say out loud what you already mastered. Needs a microphone and Chrome (or similar).',
  'hablar.emptyPrefix': 'You haven’t mastered any items to practice yet. Complete a lesson in',
  'hablar.emptySuffix': 'first — this practices pronunciation of what you already know, not new vocabulary.',

  'speaking.micNotAllowed': 'I need microphone permission.',
  'speaking.noSpeech': 'I didn’t hear anything — try again.',
  'speaking.genericError': 'Something went wrong listening. Try again.',
  'speaking.notSupported':
    'Your browser doesn’t support speech recognition (works in desktop Chrome/Edge). Try from there.',
  'speaking.excellentPronunciation': 'Excellent pronunciation!',
  'speaking.keepPracticing': 'Keep practicing, it sounds better every time.',
  'speaking.listenPronunciation': 'Listen to the pronunciation',
  'speaking.wellPronounced': 'Well pronounced!',
  'speaking.notQuiteMatch': 'Doesn’t quite match',
  'speaking.heard': (v) => `Heard: "${v.text}"`,
  'speaking.expected': (v) => `Expected: ${v.text}`,
  'speaking.listening': 'Listening...',
  'speaking.pronounce': 'Pronounce',

  'buscar.title': 'Search',
  'buscar.dictNotReady': 'Dictionary not generated',
  'buscar.dictNotReadyPrefix': 'Run',
  'buscar.dictNotReadySuffix': 'first.',
  'buscar.subtitle': 'Word, reading, or meaning. With pronunciation.',

  'searchBox.placeholder': 'Search in Japanese or English — 食べる, taberu, eat…',
  'searchBox.noVoices': 'Your browser doesn’t have pronunciation voices available.',
  'searchBox.noResults': (v) => `No results for "${v.query}".`,

  'anki.notConnected': 'Anki isn’t open',
  'anki.streakDaysSuffix': 'days in a row',
  'anki.last30Days': 'Last 30 days',
  'anki.reviewsLabel': 'reviews',
  'anki.vocabLabel': 'Vocabulary',
  'anki.synced': 'synced',
  'anki.notSynced': 'not synced',
  'anki.reviewTrend': 'Review trend',
  'anki.decksTitle': (v) => `Decks (${v.days}+ days = mastered)`,
  'anki.cardsCount': (v) => `${v.count} cards`,
  'anki.masteredCount': (v) => `${v.count} mastered`,

  'heatmap.tooltip': (v) => `${v.date}: ${v.count} ${v.count === 1 ? 'activity' : 'activities'}`,

  'temas.subtitle': 'Ready-made phrases by scene — listen and build the sentence, without seeing the text first.',

  'sceneSession.natural': (v) => `You've got the hang of "${v.title}"!`,
  'sceneSession.keepPracticing': 'Keep practicing this scene.',

  'caracteres.subtitle':
    'All hiragana and katakana at a glance, with your real progress — no need to finish a lesson to see where you stand.',
  'caracteres.practiceInSentences': 'Practice in sentences',
  'caracteres.rowTitle': (v) => `${v.kind} in short sentences`,
  'caracteres.readAndListen': (v) => `Read and listen to ${v.count} real examples with these characters.`,
  'caracteres.inSentencesSuffix': 'in sentences',

  'kanaBoard.sectionComplete': 'Section complete',
  'kanaBoard.masteredAll': (v) => `You've mastered all of ${v.title}!`,
  'kanaBoard.practice': 'Practice',
  'kanaBoard.basic': 'Basic',
  'kanaBoard.dakutenYoon': 'Dakuten and yōon',

  'nothingDue.title': (v) => `Nothing to review in ${v.title} right now`,
  'nothingDue.body':
    'Come back later, or review anyway just to check what you remember — it won’t affect your progress.',
  'nothingDue.reviewAnyway': 'Review anyway',
  'nothingDue.viewOtherUnits': 'View other units',

  'lockedUnit.title': (v) => `${v.title} is still locked`,
  'lockedUnit.body': 'Complete the previous unit first.',

  'miner.cannotMineSuffix':
    ' You can still mine, but you won’t be able to add cards or update your known vocabulary until you open it.',
  'miner.processError': 'Could not process the file',
  'miner.minedEpisodes': (v) => `Mined episodes (${v.count})`,
  'miner.wordsCount': (v) => `${v.count} words`,
  'miner.alreadyMined': 'This episode was already mined',
  'miner.learnedNewWords': (v) => `You learned ${v.count} new words!`,
  'miner.linesProcessed': (v) => `${v.count} lines processed`,
  'miner.alreadyAddedToAnki': (v) => ` · ${v.count} already added to Anki`,
  'miner.noNewWords': 'I didn’t find any new words in this episode — you already know all the vocabulary.',

  'srtDropzone.processing': 'Processing episode…',
  'srtDropzone.dropHere': 'Drop an .srt or .ass here',
  'srtDropzone.orClick':
    'or click to choose it — also add the video/audio (multi-select) for pronunciation clips',

  'sentenceCard.ideal': 'ideal',

  'wordChip.addedToAnki': (v) => `${v.lemma} added to Anki`,
  'wordChip.addFailed': (v) => `Couldn’t add ${v.lemma}`,
  'wordChip.skipped': (v) => `${v.lemma} discarded`,
  'wordChip.skippedDesc': 'It won’t show up again in other episodes.',
  'wordChip.discardTitle': 'Discard (don’t show again)',
  'wordChip.addToAnki': 'Add to Anki',

  'syncVocab.updateVocab': 'Update vocabulary',
  'syncVocab.syncedAt': (v) => `sync: ${v.date}`,
  'syncVocab.neverSynced': 'never synced',
  'syncVocab.updated': (v) => `Vocabulary updated: ${v.count} words`,
  'syncVocab.syncFailed': 'Couldn’t sync with Anki',
};

const dictionaries: Record<Lang, Dict> = { es, en };

export function getDictionary(lang: Lang): Dict {
  return dictionaries[lang];
}
