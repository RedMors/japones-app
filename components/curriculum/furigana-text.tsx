import { parseFurigana } from '@/lib/curriculum/furigana';

/** Texto japonés con furigana nativo del navegador (<ruby><rt>), igual que un libro de texto. */
export function FuriganaText({ text, className }: { text: string; className?: string }) {
  const segments = parseFurigana(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.reading ? (
          <ruby key={i}>
            {seg.text}
            <rt className="text-[0.5em] text-muted-foreground">{seg.reading}</rt>
          </ruby>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}
