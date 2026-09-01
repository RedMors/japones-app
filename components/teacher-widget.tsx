'use client';

import { useRef, useState, useTransition } from 'react';
import { GraduationCap, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { askTeacher, type ChatTurn } from '@/app/profesor/actions';
import { useLanguage } from '@/components/language-provider';
import { MarkdownLite } from '@/components/markdown-lite';

type Props = { keyConfigured: boolean };

/** Botón flotante siempre a mano, como el chat de soporte de cualquier
 *  sitio — para no tener que dejar lo que estás haciendo y navegar a otro
 *  lado por una duda rápida. */
export function TeacherWidget({ keyConfigured }: Props) {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = [t('teacher.suggestion1'), t('teacher.suggestion2')];

  if (!keyConfigured) return null;

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    const next: ChatTurn[] = [...history, { role: 'user', content: trimmed }];
    setHistory(next);
    setInput('');
    scrollToBottom();
    startTransition(async () => {
      const reply = await askTeacher(next, lang);
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
      scrollToBottom();
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="size-4" /> {t('teacher.title')}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {history.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="text-xs text-muted-foreground">{t('teacher.emptyHint')}</p>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {history.map((turn, i) => (
              <div
                key={i}
                className={cn('flex', turn.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    turn.role === 'user'
                      ? 'whitespace-pre-wrap bg-primary text-primary-foreground'
                      : 'border border-border bg-card',
                  )}
                >
                  {turn.role === 'assistant' ? <MarkdownLite text={turn.content} /> : turn.content}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> {t('teacher.thinking')}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('teacher.placeholder')}
              disabled={isPending}
              className="h-9"
            />
            <Button type="submit" size="icon" className="size-9 shrink-0" disabled={isPending || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={t('teacher.fabTitle')}
        className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="size-5" /> : <GraduationCap className="size-5" />}
      </button>
    </div>
  );
}
