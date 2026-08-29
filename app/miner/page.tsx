import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleAlert, PartyPopper } from 'lucide-react';
import { SrtDropzone } from '@/components/miner/srt-dropzone';
import { SentenceCard } from '@/components/miner/sentence-card';
import { SyncVocabButton } from '@/components/miner/sync-vocab-button';
import { getStatus } from '@/lib/anki-connect';
import { getEpisodeSummary, getKnownVocabSyncedAt, type MinedWordRow } from '@/lib/miner';
import { mineFile, addWordToAnki, skipWord, syncVocabFromAnki } from './actions';

type Group = { sentence: string; startMs: number | null; words: MinedWordRow[] };

/** Agrupa por oración preservando el orden i+1 ya calculado por el miner. */
function groupBySentence(words: MinedWordRow[]): Group[] {
  const groups: Group[] = [];
  const index = new Map<string, number>();

  for (const word of words) {
    const key = `${word.startMs}|${word.sentence}`;
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ sentence: word.sentence, startMs: word.startMs, words: [] });
    }
    groups[index.get(key)!].words.push(word);
  }
  return groups;
}

export default async function MinerPage({
  searchParams,
}: {
  searchParams: Promise<{ episode?: string; duplicate?: string; error?: string }>;
}) {
  const params = await searchParams;
  const status = await getStatus();
  const syncedAt = getKnownVocabSyncedAt();

  const episodeId = params.episode ? Number(params.episode) : null;
  const summary = episodeId ? getEpisodeSummary(episodeId) : null;
  const groups = summary ? groupBySentence(summary.words) : [];
  const addedCount = summary?.words.filter((w) => w.status === 'added').length ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Minar episodio</h1>
        <SyncVocabButton action={syncVocabFromAnki} syncedAt={syncedAt} />
      </div>

      {!status.connected && (
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>Anki no está abierto</AlertTitle>
          <AlertDescription>
            {status.message} Podés minar igual, pero no vas a poder agregar tarjetas ni
            actualizar tu vocabulario conocido hasta que lo abras.
          </AlertDescription>
        </Alert>
      )}

      {params.error && (
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>No pude procesar el archivo</AlertTitle>
          <AlertDescription>{decodeURIComponent(params.error)}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6">
        <SrtDropzone action={mineFile} />
      </div>

      {summary && (
        <div className="mt-10 space-y-6">
          <Alert className="border-accent bg-accent/40">
            <PartyPopper className="size-4 text-accent-foreground" />
            <AlertTitle>
              {params.duplicate
                ? 'Este episodio ya estaba minado'
                : `¡Aprendiste ${summary.newWordCount} palabras nuevas!`}
            </AlertTitle>
            <AlertDescription>
              {summary.animeName} {summary.episodeLabel ?? ''} · {summary.totalLines} líneas
              procesadas
              {addedCount > 0 && ` · ${addedCount} ya agregadas a Anki`}
            </AlertDescription>
          </Alert>

          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No encontré palabras nuevas en este episodio — ya conocés todo el vocabulario.
            </p>
          ) : (
            <div className="space-y-3">
              {groups.map((group, i) => (
                <SentenceCard
                  key={`${group.startMs}-${i}`}
                  sentence={group.sentence}
                  startMs={group.startMs}
                  words={group.words}
                  addAction={addWordToAnki}
                  skipAction={skipWord}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
