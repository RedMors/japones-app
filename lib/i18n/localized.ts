import type { Lang } from './dictionary';

/** Un valor de contenido curado (no de UI) con su traducción al inglés,
 *  para archivos de lib/curriculum/* que antes tenían texto fijo en
 *  español. Separado del diccionario de UI (dictionary.ts) porque este
 *  contenido vive en datos, no en claves de interfaz. */
export type Localized = { es: string; en: string };

export function localize(value: Localized, lang: Lang): string {
  return value[lang];
}
