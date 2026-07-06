import { EvaluationDetail } from "@/components/evaluation/EvaluationDetail";
import { EvaluationRomanceSection } from "@/components/evaluation/EvaluationRomanceSection";
import { EvaluationScore } from "@/components/evaluation/EvaluationScore";
import { buttonPrimaryClassName } from "@/components/home/FormField";
import type { Evaluation } from "@/types/Evaluation";

interface EvaluationCardProps {
  evaluation: Evaluation;
  onBackHome: () => void;
}

export function EvaluationCard({ evaluation, onBackHome }: EvaluationCardProps) {
  return (
    <article className="space-y-4 pb-4 sm:space-y-6 sm:pb-8">
      <header className="pt-2 text-center">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">会話結果</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          会話スキルと恋愛判定は別々に評価しています。
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <EvaluationScore evaluation={evaluation} />
      </div>

      <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm sm:p-6">
        <EvaluationRomanceSection romance={evaluation.romance} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <EvaluationDetail evaluation={evaluation} />
      </div>

      <div className="safe-bottom sticky bottom-0 -mx-4 border-t border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
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
