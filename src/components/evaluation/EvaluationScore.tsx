import type { Evaluation } from "@/types/Evaluation";
import {
  EVALUATION_ITEM_LABELS,
  EVALUATION_ITEM_MAX,
} from "@/constants/evaluationScoring";

interface EvaluationScoreProps {
  evaluation: Evaluation;
}

function ItemScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-700">{label}</span>
        <span className="font-semibold text-zinc-900">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-rose-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <p className="text-2xl tracking-widest text-amber-500" aria-label={`${stars}つ星`}>
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
    </p>
  );
}

export function EvaluationScore({ evaluation }: EvaluationScoreProps) {
  const itemEntries = Object.entries(EVALUATION_ITEM_LABELS) as Array<
    [keyof typeof EVALUATION_ITEM_LABELS, string]
  >;

  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-500">総合評価</p>
        <p className="mt-2 text-6xl font-bold text-rose-600">{evaluation.score}</p>
        <p className="text-sm text-zinc-500">/ 100点</p>
        {evaluation.difficultyAdjustment !== 0 && (
          <p className="mt-1 text-xs text-zinc-400">
            素点 {evaluation.baseScore}点
            {evaluation.difficultyAdjustment > 0 ? " + " : " "}
            {evaluation.difficultyAdjustment !== 0
              ? `難易度補正 ${evaluation.difficultyAdjustment > 0 ? "+" : ""}${evaluation.difficultyAdjustment}`
              : null}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center">
        <p className="text-xs font-medium text-amber-700">判定</p>
        <StarRating stars={evaluation.stars} />
        <p className="mt-2 text-base font-semibold text-amber-900">
          {evaluation.verdict}
        </p>
        <p className="mt-1 text-sm text-amber-800">{evaluation.bandLabel}</p>
        <p className="mt-3 text-sm text-amber-900">
          もう一度会いたい確率:{" "}
          <span className="font-bold">{evaluation.remeetProbability}%</span>
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-800">項目別スコア</h3>
        {itemEntries.map(([key, label]) => (
          <ItemScoreBar
            key={key}
            label={label}
            value={evaluation.itemScores[key]}
            max={EVALUATION_ITEM_MAX[key]}
          />
        ))}
      </div>
    </section>
  );
}
