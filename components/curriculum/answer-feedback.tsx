'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Flame, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnswerBannerProps = {
  isCorrect: boolean;
  text: string;
  children?: React.ReactNode;
};

/** Franja inferior estilo Duolingo: se anima al aparecer y cambia de color según el resultado. */
export function AnswerBanner({ isCorrect, text, children }: AnswerBannerProps) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'fixed inset-x-0 bottom-0 border-t backdrop-blur',
        isCorrect
          ? 'border-accent-foreground/30 bg-accent text-accent-foreground'
          : 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col gap-3 px-6 py-4 lg:max-w-2xl">
        <div className="flex items-center gap-2 font-semibold">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.05 }}
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full',
              isCorrect ? 'bg-accent-foreground text-accent' : 'bg-destructive text-white',
            )}
          >
            {isCorrect ? <Check className="size-4" /> : <X className="size-4" />}
          </motion.span>
          {text}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

/** Envuelve el contenido de la pregunta y lo sacude cuando la respuesta es incorrecta. */
export function ShakeOnWrong({ trigger, children }: { trigger: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={trigger ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

/** Contador de racha en vivo durante la sesión, con pop al incrementar. */
export function StreakBadge({ count, label }: { count: number; label: string }) {
  if (count < 2) return null;
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className="flex shrink-0 items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500"
      >
        <Flame className="size-3.5" />
        {label}
      </motion.span>
    </AnimatePresence>
  );
}
