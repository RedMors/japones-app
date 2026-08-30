'use client';

/**
 * Reconocimiento de voz vía Web Speech API (SpeechRecognition), no vía red:
 * en Chrome esto sí manda audio a un servicio de Google para transcribir
 * (no es 100% on-device como speechSynthesis), pero no pasa por ningún
 * servidor propio ni requiere API key. Sin soporte en Firefox; en Safari es
 * irregular — tratar como mejora progresiva, igual que TTS.
 */

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionAvailable(): boolean {
  return getRecognitionCtor() !== null;
}

export type RecognizeResult =
  | { ok: true; transcript: string }
  | { ok: false; error: 'no-speech' | 'not-allowed' | 'aborted' | 'other' };

/**
 * Escucha un único intento de habla y devuelve la mejor transcripción.
 * No hay forma de "cancelar" a mitad sin disparar onerror=aborted — quien
 * llama debe simplemente ignorar el resultado si ya no le importa.
 */
export function recognizeJapaneseSpeech(): Promise<RecognizeResult> {
  return new Promise((resolve) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      resolve({ ok: false, error: 'other' });
      return;
    }

    const recognition = new Ctor();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let settled = false;
    const finish = (result: RecognizeResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      finish({ ok: true, transcript });
    };
    recognition.onerror = (event) => {
      const error =
        event.error === 'no-speech' || event.error === 'not-allowed' || event.error === 'aborted'
          ? event.error
          : 'other';
      finish({ ok: false, error });
    };
    recognition.onend = () => finish({ ok: false, error: 'no-speech' });

    recognition.start();
  });
}
