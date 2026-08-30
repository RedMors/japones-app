'use server';

import fs from 'node:fs';
import { redirect } from 'next/navigation';
import { getDb, getSetting, setSetting } from '@/lib/db';
import {
  mineEpisode,
  setWordStatus,
  ignoreWordGlobally,
  refreshKnownVocab,
  DuplicateEpisodeError,
} from '@/lib/miner';
import { clipAbsolutePath } from '@/lib/audio-clip';
import {
  getDeckNames,
  getModelNames,
  guessTargetConfig,
  addWordNote,
  storeMediaFile,
  type AnkiTargetConfig,
} from '@/lib/anki-connect';

export type MineResult = { ok: true; episodeId: number } | { ok: false; error: string };

export async function mineFile(formData: FormData): Promise<void> {
  const file = formData.get('file');
  if (!(file instanceof File)) return;

  const buffer = new Uint8Array(await file.arrayBuffer());

  const media = formData.get('media');
  const mediaFile = media instanceof File ? media : null;

  try {
    const summary = await mineEpisode({
      filename: file.name,
      buffer,
      ...(mediaFile && {
        mediaFilename: mediaFile.name,
        mediaBuffer: new Uint8Array(await mediaFile.arrayBuffer()),
      }),
    });
    redirect(`/miner?episode=${summary.episodeId}`);
  } catch (err) {
    if (err instanceof DuplicateEpisodeError) {
      redirect(`/miner?episode=${err.episodeId}&duplicate=1`);
    }
    // Next intercepta redirect() con una excepción propia: no es un error real.
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    redirect(`/miner?error=${encodeURIComponent((err as Error).message)}`);
  }
}

/**
 * Elige mazo y modelo de destino sin pedirte que configures nada antes de
 * poder minar. La primera vez adivina y guarda la elección; después la reusa.
 */
async function resolveAnkiTarget(): Promise<AnkiTargetConfig> {
  const savedDeck = getSetting('anki_target_deck');
  const savedModel = getSetting('anki_target_model');

  if (savedDeck && savedModel) {
    return guessTargetConfig(savedDeck, savedModel);
  }

  const [decks, models] = await Promise.all([getDeckNames(), getModelNames()]);
  if (decks.length === 0) throw new Error('No hay mazos en Anki todavía. Creá uno primero.');
  if (models.length === 0) throw new Error('No hay tipos de nota en Anki todavía.');

  // Preferí un mazo/modelo que mencione japonés o vocabulario; si no hay pista,
  // el primero de la lista es tan buena apuesta como cualquier otra.
  const deck = decks.find((d) => /jap|vocab|jp|漢字|単語/i.test(d)) ?? decks[0];
  const model = models.find((m) => /vocab|word|jap/i.test(m)) ?? models[0];

  setSetting('anki_target_deck', deck);
  setSetting('anki_target_model', model);

  return guessTargetConfig(deck, model);
}

export async function addWordToAnki(
  wordId: number,
): Promise<{ ok: true; noteId: number } | { ok: false; error: string }> {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT mw.lemma, mw.reading, mw.meaning, mw.sentence, mw.audio_clip_path,
              e.anime_name, e.episode_label
       FROM mined_words mw JOIN episodes e ON e.id = mw.episode_id
       WHERE mw.id = ?`,
    )
    .get(wordId) as
    | {
        lemma: string;
        reading: string | null;
        meaning: string | null;
        sentence: string;
        audio_clip_path: string | null;
        anime_name: string;
        episode_label: string | null;
      }
    | undefined;

  if (!row) return { ok: false, error: 'Palabra no encontrada.' };

  try {
    const target = await resolveAnkiTarget();

    let audioClipFilename: string | null = null;
    if (row.audio_clip_path) {
      const absPath = clipAbsolutePath(row.audio_clip_path);
      if (fs.existsSync(absPath)) {
        const base64 = fs.readFileSync(absPath).toString('base64');
        audioClipFilename = await storeMediaFile(`jp-mining-${wordId}.mp3`, base64);
      }
    }

    const noteId = await addWordNote(
      {
        word: row.lemma,
        reading: row.reading,
        meaning: row.meaning,
        sentence: row.sentence,
        animeName: row.anime_name,
        episodeLabel: row.episode_label,
        audioClipFilename,
      },
      target,
    );
    setWordStatus(wordId, 'added', noteId);
    return { ok: true, noteId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido.' };
  }
}

export async function skipWord(wordId: number, lemma: string): Promise<void> {
  ignoreWordGlobally(lemma);
  setWordStatus(wordId, 'skipped');
}

export async function syncVocabFromAnki(): Promise<
  { ok: true; count: number } | { ok: false; error: string }
> {
  try {
    const count = await refreshKnownVocab();
    return { ok: true, count };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido.' };
  }
}
