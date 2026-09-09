/**
 * Traducciones IA para el miner (glosas de palabra + oración completa),
 * cacheadas por (lema, lang) / (hash de oración, lang) — cada una se le pide
 * a OpenRouter una sola vez en toda la vida de la app, nunca por episodio.
 * Server-only (usa OpenRouter). Si falta la API key o la llamada falla, la
 * palabra/oración simplemente queda sin traducción en `lang` — nunca rompe
 * el minado, el inglés de JMdict sigue disponible como fallback.
 */
import crypto from 'node:crypto';
import { getDb } from './db.ts';
import { askOpenRouterChat } from './openrouter.ts';
import type { Lang } from './i18n/dictionary.ts';

function hashSentence(s: string): string {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function extractJsonArray(text: string): unknown[] {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('La respuesta no trae un JSON array.');
  return JSON.parse(text.slice(start, end + 1)) as unknown[];
}

// --- glosas de palabra --------------------------------------------------

function getCachedGloss(lemma: string, lang: Lang): string | null {
  const row = getDb()
    .prepare('SELECT gloss FROM word_glosses_i18n WHERE lemma = ? AND lang = ?')
    .get(lemma, lang) as { gloss: string } | undefined;
  return row?.gloss ?? null;
}

function setCachedGloss(lemma: string, lang: Lang, gloss: string): void {
  getDb()
    .prepare(
      `INSERT INTO word_glosses_i18n (lemma, lang, gloss) VALUES (?, ?, ?)
       ON CONFLICT(lemma, lang) DO UPDATE SET gloss = excluded.gloss`,
    )
    .run(lemma, lang, gloss);
}

type WordInput = { lemma: string; englishGloss: string; pos: string | null };

async function translateGlossBatch(
  words: WordInput[],
  lang: Lang,
): Promise<Map<string, string>> {
  const list = words
    .map((w, i) => `${i + 1}. ${w.lemma} (${w.pos ?? '?'}): ${w.englishGloss}`)
    .join('\n');
  const prompt =
    `Traducí cada glosa de diccionario japonés-inglés a español natural. ` +
    `Específica al sentido real de esa palabra — nunca una traducción vaga, ` +
    `de una sola palabra genérica, ni un resumen. Devolvé SOLO un JSON array ` +
    `de strings en el mismo orden, sin numerar ni texto extra:\n\n${list}`;
  const raw = await askOpenRouterChat([{ role: 'user', content: prompt }], 1200);
  const parsed = extractJsonArray(raw) as string[];
  const out = new Map<string, string>();
  words.forEach((w, i) => {
    if (typeof parsed[i] === 'string' && parsed[i].trim()) out.set(w.lemma, parsed[i].trim());
  });
  return out;
}

/**
 * Devuelve la glosa en `lang` para cada palabra que la tenga (cacheada o
 * recién traducida). En inglés no hace falta IA — JMdict ya es inglés.
 */
export async function ensureWordGlosses(
  words: WordInput[],
  lang: Lang,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (lang === 'en') {
    for (const w of words) if (w.englishGloss) out.set(w.lemma, w.englishGloss);
    return out;
  }

  const missing: WordInput[] = [];
  for (const w of words) {
    if (!w.englishGloss) continue;
    const cached = getCachedGloss(w.lemma, lang);
    if (cached) out.set(w.lemma, cached);
    else missing.push(w);
  }
  if (missing.length === 0 || !process.env.OPENROUTER_API_KEY) return out;

  const BATCH = 40;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    try {
      const translated = await translateGlossBatch(batch, lang);
      for (const [lemma, gloss] of translated) {
        setCachedGloss(lemma, lang, gloss);
        out.set(lemma, gloss);
      }
    } catch {
      // Sin traducción esta vuelta: se reintenta solo/a en el próximo
      // minado que necesite alguna de estas palabras.
    }
  }
  return out;
}

// --- traducción de oración ------------------------------------------------

function getCachedSentence(sentence: string, lang: Lang): string | null {
  const row = getDb()
    .prepare('SELECT translation FROM sentence_translations WHERE sentence_hash = ? AND lang = ?')
    .get(hashSentence(sentence), lang) as { translation: string } | undefined;
  return row?.translation ?? null;
}

function setCachedSentence(sentence: string, lang: Lang, translation: string): void {
  getDb()
    .prepare(
      `INSERT INTO sentence_translations (sentence_hash, sentence, lang, translation)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(sentence_hash, lang) DO UPDATE SET translation = excluded.translation`,
    )
    .run(hashSentence(sentence), sentence, lang, translation);
}

async function translateSentenceBatch(
  sentences: string[],
  lang: Lang,
): Promise<Map<string, string>> {
  const targetName = lang === 'es' ? 'español' : 'inglés';
  const list = sentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const prompt =
    `Traducí cada oración de un subtítulo de anime a ${targetName}. Traducción ` +
    `natural y CONCRETA al significado real de esa oración específica en su ` +
    `contexto — nunca un resumen vago ni una paráfrasis genérica. Devolvé SOLO ` +
    `un JSON array de strings en el mismo orden, sin numerar ni texto extra:\n\n${list}`;
  const raw = await askOpenRouterChat([{ role: 'user', content: prompt }], 2000);
  const parsed = extractJsonArray(raw) as string[];
  const out = new Map<string, string>();
  sentences.forEach((s, i) => {
    if (typeof parsed[i] === 'string' && parsed[i].trim()) out.set(s, parsed[i].trim());
  });
  return out;
}

/** Igual que ensureWordGlosses pero para la oración completa (contenido nuevo, no existía en ningún idioma antes). */
export async function ensureSentenceTranslations(
  sentences: string[],
  lang: Lang,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const unique = [...new Set(sentences)].filter(Boolean);

  const missing: string[] = [];
  for (const s of unique) {
    const cached = getCachedSentence(s, lang);
    if (cached) out.set(s, cached);
    else missing.push(s);
  }
  if (missing.length === 0 || !process.env.OPENROUTER_API_KEY) return out;

  const BATCH = 25;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    try {
      const translated = await translateSentenceBatch(batch, lang);
      for (const [sentence, translation] of translated) {
        setCachedSentence(sentence, lang, translation);
        out.set(sentence, translation);
      }
    } catch {
      // Igual que las glosas: se reintenta en el próximo minado/vista que la necesite.
    }
  }
  return out;
}
