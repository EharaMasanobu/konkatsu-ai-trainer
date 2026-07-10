import type { EvaluationCoachResult } from "@konkatsu/shared-types";

interface CoachSummaryProps {
  coach: EvaluationCoachResult;
}

export function CoachSummary({ coach }: CoachSummaryProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm sm:p-6">
      <p className="text-sm font-medium text-zinc-500">総合スコア</p>
      <p className="mt-1 text-6xl font-bold text-rose-600 sm:text-7xl">{coach.totalScore}</p>
      <p className="text-sm text-zinc-500">/ 100点</p>
      <p className="mt-4 text-left text-sm leading-relaxed text-zinc-700 sm:text-base">
        {coach.summary}
      </p>
    </section>
  );
}
