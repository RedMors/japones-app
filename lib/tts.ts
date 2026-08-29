'use client';

/**
 * Pronunciación vía Web Speech API (`speechSynthesis`), no vía red: el
 * navegador usa las voces instaladas en el sistema operativo. En macOS con
 * Chrome/Safari suele haber al menos una voz japonesa (Kyoko/Otoya) sin
 * necesidad de instalar nada ni de llamar a ningún servicio.
 *
 * Si no hay ninguna voz ja-JP disponible, se pide igual con `lang='ja-JP'` —
 * el navegador puede resolverla con una voz genérica o fallar en silencio.
 * No hay forma 100% confiable de saber de antemano si sonará bien.
 */
export function isTtsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Nombres que en Chrome/macOS suelen mapear a voces neurales/premium en vez
// de la síntesis por defecto (más robótica). Se prueban en orden.
const PREFERRED_JA_VOICE_NAMES = [
  'Google 日本語',
  'Kyoko (Enhanced)',
  'Kyoko (Premium)',
  'O-Ren (Premium)',
  'O-Ren (Enhanced)',
  'Kyoko',
  'O-Ren',
  'Otoya',
];

let cachedJaVoice: SpeechSynthesisVoice | null | undefined;

function pickJapaneseVoice(): SpeechSynthesisVoice | null {
  if (cachedJaVoice !== undefined) return cachedJaVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // aún no cargaron, no cachear

  const jaVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ja'));

  for (const name of PREFERRED_JA_VOICE_NAMES) {
    const match = jaVoices.find((v) => v.name === name);
    if (match) {
      cachedJaVoice = match;
      return match;
    }
  }

  cachedJaVoice = jaVoices[0] ?? null;
  return cachedJaVoice;
}

// Las voces cargan async la primera vez (evento 'voiceschanged'); esto
// asegura que la primera pronunciación de la sesión ya use la voz elegida
// en vez de caer siempre al fallback por caché vacío.
if (typeof window !== 'undefined' && isTtsAvailable()) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedJaVoice = undefined;
    pickJapaneseVoice();
  });
}

export interface SpeakOptions {
  /** Se dispara por cada palabra/carácter a medida que se pronuncia. Soporte
   *  del navegador es irregular para ja-JP (mejor en Chrome, puede no disparar
   *  nunca en Safari) — tratar como mejora progresiva, no como garantía. */
  onBoundary?: (charIndex: number, charLength: number) => void;
  onEnd?: () => void;
}

export function speakJapanese(text: string, options?: SpeakOptions): void {
  if (!isTtsAvailable() || !text.trim()) return;

  window.speechSynthesis.cancel(); // no encimar pronunciaciones si clickean rápido

  // Bug conocido de Chrome: speak() llamado en el mismo tick que cancel()
  // a veces se pierde en silencio. Un setTimeout(0) lo evita.
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;

    const voice = pickJapaneseVoice();
    if (voice) utterance.voice = voice;

    if (options?.onBoundary) {
      utterance.onboundary = (event) => {
        options.onBoundary?.(event.charIndex, event.charLength ?? 1);
      };
    }
    if (options?.onEnd) utterance.onend = options.onEnd;

    window.speechSynthesis.speak(utterance);
  }, 0);
}
