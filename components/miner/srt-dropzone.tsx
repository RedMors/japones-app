'use client';

import { useRef, useState, useTransition } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  action: (formData: FormData) => Promise<void>;
};

const SUB_RE = /\.(srt|ass|ssa)$/i;

/**
 * Seleccionar el/los archivo(s) YA dispara el procesamiento: no hay botón
 * "subir" de por medio. Un click para abrir el picker, un click (o
 * selección múltiple) para elegir, listo.
 *
 * Acepta opcionalmente el video/audio del mismo episodio junto con el .srt
 * (para clips de audio por oración vía ffmpeg) — se detecta por extensión,
 * no hace falta un campo separado.
 */
export function SrtDropzone({ action }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(files: FileList | File[]) {
    const list = Array.from(files);
    const subtitleFile = list.find((f) => SUB_RE.test(f.name));
    if (!subtitleFile) return; // solo video/audio suelto, sin .srt no hay nada que minar

    const mediaFile = list.find((f) => f !== subtitleFile);

    const formData = new FormData();
    formData.append('file', subtitleFile);
    if (mediaFile) formData.append('media', mediaFile);
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
        if (e.dataTransfer.files?.length) submit(e.dataTransfer.files);
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
        accept=".srt,.ass,.ssa,video/*,audio/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) submit(e.target.files);
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
        <p className="text-sm text-muted-foreground">
          o hacé click para elegirlo — sumá también el video/audio (selección múltiple) para
          clips de pronunciación
        </p>
      </div>
    </div>
  );
}
