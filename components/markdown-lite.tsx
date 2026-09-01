import { Fragment } from 'react';
import { cn } from '@/lib/utils';

/**
 * Renderer de markdown mínimo para respuestas de IA (profesor, explicación
 * de gramática) — sin dependencia nueva (react-markdown arrastra ~80
 * paquetes del ecosistema unified/remark, mucho para negrita + listas).
 * Cubre lo que el prompt del profesor efectivamente produce: negrita,
 * listas con "-"/"*"/"1.", encabezados "#", párrafos. No es un parser de
 * markdown completo (sin tablas, links, code fences) — si el prompt cambia
 * y necesita más, ahí sí se justifica una librería.
 */

function parseInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className="rounded bg-muted px-1 py-0.5 text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'paragraph'; text: string };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.+)/);
    if (heading) {
      blocks.push({ kind: 'heading', text: heading[1] });
      i++;
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.+)/);
    const numberedMatch = line.match(/^\s*\d+[.)]\s+(.+)/);
    if (bulletMatch || numberedMatch) {
      const ordered = !!numberedMatch;
      const items: string[] = [(bulletMatch ?? numberedMatch)![1]];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        const nextBullet = next.match(/^\s*[-*]\s+(.+)/);
        const nextNumbered = next.match(/^\s*\d+[.)]\s+(.+)/);
        const nextItem = ordered ? nextNumbered : nextBullet;
        if (!nextItem) break;
        items.push(nextItem[1]);
        i++;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }

    const paragraphLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^#{1,6}\s+/) &&
      !lines[i].match(/^\s*[-*]\s+/) &&
      !lines[i].match(/^\s*\d+[.)]\s+/)
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    blocks.push({ kind: 'paragraph', text: paragraphLines.join('\n') });
  }

  return blocks;
}

export function MarkdownLite({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const key = `b-${i}`;
        if (block.kind === 'heading') {
          return (
            <p key={key} className="font-semibold">
              {parseInline(block.text, key)}
            </p>
          );
        }
        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={key} className={cn('space-y-1 pl-5', block.ordered ? 'list-decimal' : 'list-disc')}>
              {block.items.map((item, j) => (
                <li key={`${key}-${j}`}>{parseInline(item, `${key}-${j}`)}</li>
              ))}
            </ListTag>
          );
        }
        return (
          <p key={key} className="whitespace-pre-wrap">
            {parseInline(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}
