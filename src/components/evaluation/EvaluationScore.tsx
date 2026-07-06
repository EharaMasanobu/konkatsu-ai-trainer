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

export function EvaluationScore({ evaluation }: EvaluationScoreProps) {
  const itemEntries = Object.entries(EVALUATION_ITEM_LABELS) as Array<
    [keyof typeof EVALUATION_ITEM_LABELS, string]
  >;

  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-500">会話スコア</p>
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
        <p className="mt-2 text-sm text-zinc-600">{evaluation.bandLabel}</p>
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
