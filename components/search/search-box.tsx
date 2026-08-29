'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Search, Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { speakJapanese, isTtsAvailable } from '@/lib/tts';
import { hiraganaToRomaji } from '@/lib/romaji';
import type { search as searchAction } from '@/app/buscar/actions';
import type { DictEntry } from '@/lib/dictionary';

const DEBOUNCE_MS = 250;

type SpokenRange = { key: string; start: number; end: number };

function entryKey(entry: DictEntry): string {
  return `${entry.lemma}-${entry.glosses}`;
}

// Resalta el tramo de `reading` que se está pronunciando en este instante
// (estilo Duolingo). `range` viene de SpeechSynthesisUtterance.onboundary —
// soporte irregular entre navegadores, por eso siempre hay texto de fallback.
function renderSpokenReading(reading: string, range: SpokenRange | null) {
  if (!range || range.start < 0) return reading;

  return Array.from(reading).map((char, i) => (
    <span
      key={i}
      className={i >= range.start && i < range.end ? 'text-foreground font-semibold' : undefined}
    >
      {char}
    </span>
  ));
}

export function SearchBox({ search }: { search: typeof searchAction }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictEntry[]>([]);
  const [searched, setSearched] = useState(false);
  const [, startTransition] = useTransition();
  const [spoken, setSpoken] = useState<SpokenRange | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttsAvailable = useRef(false);

  useEffect(() => {
    ttsAvailable.current = isTtsAvailable();
  }, []);

  function handleSpeak(entry: DictEntry) {
    const key = entryKey(entry);
    const text = entry.reading || entry.lemma;
    setSpoken({ key, start: -1, end: -1 });
    speakJapanese(text, {
      onBoundary: (charIndex, charLength) =>
        setSpoken({ key, start: charIndex, end: charIndex + charLength }),
      onEnd: () => setSpoken(null),
    });
  }

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const found = await search(trimmed);
        setResults(found);
        setSearched(true);
      });
    }, DEBOUNCE_MS);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar en japonés o en inglés — 食べる, taberu, eat…"
          className="pl-9"
        />
      </div>

      {!ttsAvailable.current && searched && (
        <p className="text-xs text-muted-foreground">
          Tu navegador no tiene voces de pronunciación disponibles.
        </p>
      )}

      <div className="space-y-2">
        {results.map((entry) => (
          <Card key={entryKey(entry)}>
            <CardContent className="flex items-start gap-3 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="jp text-xl">{entry.lemma}</span>
                  {entry.reading && (
                    <span className="text-sm text-muted-foreground">
                      {renderSpokenReading(
                        entry.reading,
                        spoken?.key === entryKey(entry) ? spoken : null,
                      )}
                    </span>
                  )}
                  {entry.reading && (
                    <span className="text-xs text-muted-foreground">
                      ({hiraganaToRomaji(entry.reading)})
                    </span>
                  )}
                  {entry.pos && (
                    <Badge variant="secondary" className="text-[10px]">
                      {entry.pos}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm">{entry.glosses}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => handleSpeak(entry)}
                title="Escuchar"
              >
                <Volume2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {searched && results.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin resultados para &quot;{query}&quot;.</p>
        )}
      </div>
    </div>
  );
}
