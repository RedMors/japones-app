import { notFound } from 'next/navigation';
import { getUnit } from '@/lib/curriculum/units';
import { getUnitStatus, getSessionItems } from '@/lib/curriculum/progress';
import { buildSession } from '@/lib/curriculum/exercises';
import { SessionRunner } from '@/components/curriculum/session-runner';
import { LockedUnit } from '@/components/curriculum/locked-unit';
import { NothingDue } from '@/components/curriculum/nothing-due';
import { beginSession, submitAnswer, endSession, explainGrammar } from './actions';

const REVIEW_SESSION_SIZE = 10;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function UnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { unitId } = await params;
  const { review } = await searchParams;
  const isReview = review === '1';

  const unit = getUnit(unitId);
  if (!unit) notFound();

  const status = getUnitStatus(unitId);
  if (status === 'locked') return <LockedUnit title={unit.title} />;

  // Repaso libre: cualquier ítem de la unidad, sin importar si venció su
  // repaso programado. No se persiste nada — es solo para "¿me acuerdo?".
  const items = isReview
    ? shuffle(unit.items).slice(0, REVIEW_SESSION_SIZE)
    : getSessionItems(unitId);

  if (items.length === 0) {
    return <NothingDue title={unit.title} unitId={unit.id} canReview={unit.items.length > 0} />;
  }

  const questions = buildSession(items, unit.items);

  return (
    <main className="mx-auto max-w-xl px-6 py-16 lg:max-w-2xl">
      <SessionRunner
        unitId={unit.id}
        unitTitle={unit.title}
        questions={questions}
        beginSession={beginSession}
        submitAnswer={submitAnswer}
        endSession={endSession}
        explainGrammar={unit.id.startsWith('grammar-') ? explainGrammar : undefined}
        readOnly={isReview}
      />
    </main>
  );
}
