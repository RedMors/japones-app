import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleAlert, PartyPopper, History } from 'lucide-react';
import { SrtDropzone } from '@/components/miner/srt-dropzone';
import { SentenceCard } from '@/components/miner/sentence-card';
import { SyncVocabButton } from '@/components/miner/sync-vocab-button';
import { getStatus } from '@/lib/anki-connect';
import { getEpisodeSummary, getKnownVocabSyncedAt, listEpisodes, type MinedWordRow } from '@/lib/miner';
import { annotateFurigana } from '@/lib/tokenizer';
import { mineFile, addWordToAnki, skipWord, syncVocabFromAnki } from './actions';
import { getLanguage } from '@/lib/i18n/language';
import { getDictionary, t } from '@/lib/i18n/dictionary';

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
  const dict = getDictionary(await getLanguage());
  const status = await getStatus();
  const syncedAt = getKnownVocabSyncedAt();

  const episodeId = params.episode ? Number(params.episode) : null;
  const summary = episodeId ? getEpisodeSummary(episodeId) : null;
  const groups = summary ? groupBySentence(summary.words) : [];
  const groupsWithFurigana = await Promise.all(
    groups.map(async (group) => ({
      ...group,
      furiganaSentence: await annotateFurigana(group.sentence),
    })),
  );
  const addedCount = summary?.words.filter((w) => w.status === 'added').length ?? 0;
  const episodes = listEpisodes();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t(dict, 'nav.mineEpisode')}</h1>
        <SyncVocabButton action={syncVocabFromAnki} syncedAt={syncedAt} />
      </div>

      {!status.connected && (
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>{t(dict, 'anki.notConnected')}</AlertTitle>
          <AlertDescription>
            {status.message}
            {t(dict, 'miner.cannotMineSuffix')}
          </AlertDescription>
        </Alert>
      )}

      {params.error && (
        <Alert className="mt-6" variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>{t(dict, 'miner.processError')}</AlertTitle>
          <AlertDescription>{decodeURIComponent(params.error)}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6">
        <SrtDropzone action={mineFile} />
      </div>

      {episodes.length > 0 && (
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <History className="size-4" />
            {t(dict, 'miner.minedEpisodes', { count: episodes.length })}
          </h2>
          <div className="mt-2 divide-y divide-border rounded-lg border">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/miner?episode=${ep.id}`}
                className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm hover:bg-muted/50 ${
                  ep.id === episodeId ? 'bg-muted/50' : ''
                }`}
              >
                <span className="truncate">
                  {ep.animeName} {ep.episodeLabel ?? ''}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t(dict, 'miner.wordsCount', { count: ep.newWordCount })} ·{' '}
                  {new Date(ep.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-10 space-y-6">
          <Alert className="border-accent bg-accent/40">
            <PartyPopper className="size-4 text-accent-foreground" />
            <AlertTitle>
              {params.duplicate
                ? t(dict, 'miner.alreadyMined')
                : t(dict, 'miner.learnedNewWords', { count: summary.newWordCount })}
            </AlertTitle>
            <AlertDescription>
              {summary.animeName} {summary.episodeLabel ?? ''} ·{' '}
              {t(dict, 'miner.linesProcessed', { count: summary.totalLines })}
              {addedCount > 0 && t(dict, 'miner.alreadyAddedToAnki', { count: addedCount })}
            </AlertDescription>
          </Alert>

          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t(dict, 'miner.noNewWords')}</p>
          ) : (
            <div className="space-y-3">
              {groupsWithFurigana.map((group, i) => (
                <SentenceCard
                  key={`${group.startMs}-${i}`}
                  sentence={group.sentence}
                  furiganaSentence={group.furiganaSentence}
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
