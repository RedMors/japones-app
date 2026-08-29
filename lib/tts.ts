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

export function speakJapanese(text: string): void {
  if (!isTtsAvailable() || !text.trim()) return;

  window.speechSynthesis.cancel(); // no encimar pronunciaciones si clickean rápido
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
