'use client';

import { useRef, useState, useTransition } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  action: (formData: FormData) => Promise<void>;
};

/**
 * Seleccionar el archivo YA dispara el procesamiento: no hay botón "subir"
 * de por medio. Un click para abrir el picker, un click para elegir el
 * archivo, listo.
 */
export function SrtDropzone({ action }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    startTransition(() => {
      void action(formData);
    });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) submit(file);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors',
        isDragging ? 'border-primary bg-accent/40' : 'border-border hover:bg-muted/50',
        isPending && 'pointer-events-none opacity-60',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".srt,.ass,.ssa"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) submit(file);
        }}
      />
      {isPending ? (
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      ) : (
        <UploadCloud className="size-8 text-muted-foreground" />
      )}
      <div>
        <p className="font-medium">
          {isPending ? 'Procesando episodio…' : 'Soltá un .srt o .ass acá'}
        </p>
        <p className="text-sm text-muted-foreground">o hacé click para elegirlo</p>
      </div>
    </div>
  );
}
