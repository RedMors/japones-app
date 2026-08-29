export type SubtitleLine = {
  /** Orden dentro del archivo, empezando en 0. */
  index: number;
  startMs: number;
  endMs: number;
  /** Texto ya limpio: sin tags, sin overrides, sin saltos de línea. */
  text: string;
};

export type SubtitleFormat = 'srt' | 'ass';

export type ParsedSubtitles = {
  format: SubtitleFormat;
  lines: SubtitleLine[];
  /** Diálogos encontrados antes de filtrar. Para el resumen del episodio. */
  totalCues: number;
  /** Descartados por no tener japonés (carteles, créditos en inglés). */
  droppedNonJapanese: number;
};

export type ParseOptions = {
  /** Descartar líneas sin japonés. Por defecto sí. */
  requireJapanese?: boolean;
};
