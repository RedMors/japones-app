'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JLPT_GOAL_LEVELS, type JlptGoalLevel } from '@/lib/curriculum/goal-levels';
import type { saveGoal } from '@/app/ajustes/actions';

type Props = {
  currentLevel: JlptGoalLevel | null;
  currentDate: string | null;
  saveGoal: typeof saveGoal;
};

export function GoalForm({ currentLevel, currentDate, saveGoal }: Props) {
  const [level, setLevel] = useState<JlptGoalLevel>(currentLevel ?? 'N5');
  const [date, setDate] = useState(currentDate ?? '');
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await saveGoal(level, date);
      toast('Meta guardada — ¡vamos por eso!', { icon: <Target className="size-4" /> });
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nivel que quiero alcanzar</label>
        <div className="flex flex-wrap gap-2">
          {JLPT_GOAL_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                level === l
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input text-muted-foreground hover:text-foreground'
              }`}
            >
              JLPT {l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="goal-date" className="text-sm font-medium">
          Fecha objetivo (opcional)
        </label>
        <input
          id="goal-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        />
        <p className="text-xs text-muted-foreground">
          Si la ponés, el dashboard de Progreso te muestra cuánto te falta para llegar a tiempo.
        </p>
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar meta'}
      </Button>
    </div>
  );
}
