import { EvaluationDetail } from "../evaluation/EvaluationDetail";
import { EvaluationRomanceSection } from "../evaluation/EvaluationRomanceSection";
import { EvaluationScore } from "../evaluation/EvaluationScore";
import { buttonPrimaryClassName } from "../ui/buttonStyles";
import type { Evaluation } from "@konkatsu/shared-types";

interface EvaluationCardProps {
  evaluation: Evaluation;
  onBackHome: () => void;
}

export function EvaluationCard({ evaluation, onBackHome }: EvaluationCardProps) {
  return (
    <article className="space-y-6 px-4 pb-6 sm:space-y-8 sm:pb-10">
      <header className="pt-4 text-center sm:pt-6">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">会話結果</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          会話スキルと恋愛判定は別々に評価しています。
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <EvaluationScore evaluation={evaluation} />
      </div>

      <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-8">
        <EvaluationRomanceSection romance={evaluation.romance} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <EvaluationDetail evaluation={evaluation} />
      </div>

      <div className="safe-bottom sticky bottom-0 -mx-4 border-t border-zinc-200 bg-zinc-50/95 px-4 py-4 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <button
          type="button"
          onClick={onBackHome}
          className={`${buttonPrimaryClassName} !bg-zinc-800 active:!bg-zinc-900`}
        >
          ホームへ戻る
        </button>
      </div>
    </article>
  );
}
