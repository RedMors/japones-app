import { alignRomaji } from '@/lib/curriculum/romaji-align';

type Props = {
  text: string;
  className?: string;
};

/** Texto en kana con el romaji alineado arriba de cada mora, tipo
 *  Duolingo — no debajo de la palabra entera, sino segmento por segmento
 *  (きゃ = "kya" arriba de las dos fichas, no "ki" arriba de き y "ya"
 *  arriba de ゃ). Caracteres sin romaji conocido (kanji, signos) se
 *  muestran igual, solo sin la lectura arriba. */
export function RomajiText({ text, className }: Props) {
  const segments = alignRomaji(text);

  return (
    <span className={className}>
      {segments.map((seg, i) => (
        <span key={i} className="jp inline-flex flex-col items-center align-bottom leading-none">
          <span className="text-[0.4em] font-normal text-muted-foreground">{seg.romaji ?? ' '}</span>
          <span>{seg.chars}</span>
        </span>
      ))}
    </span>
  );
}
