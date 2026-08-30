'use client';

/**
 * Sonidos de acierto/error generados con Web Audio, sin archivos de audio
 * ni red de por medio — dos tonos simples (arpeggio ascendente para
 * "correcto", nota baja corta para "incorrecto"), igual de "cero cloud"
 * que el resto de la app.
 */
let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function beep(ctx: AudioContext, freq: number, startAt: number, duration: number, gain: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime + startAt);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration);
}

export function playCorrectSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  beep(ctx, 523.25, 0, 0.1, 0.15); // C5
  beep(ctx, 783.99, 0.08, 0.15, 0.15); // G5
}

export function playIncorrectSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  beep(ctx, 220, 0, 0.18, 0.12); // A3, seco y corto — no punitivo
}
