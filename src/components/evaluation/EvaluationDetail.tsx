import type { Evaluation, EvaluationImprovement } from "@/types/Evaluation";
import { EvaluationCharacterSection } from "@/components/evaluation/EvaluationCharacterSection";

interface EvaluationDetailProps {
  evaluation: Evaluation;
}

function ImprovementCard({ item }: { item: EvaluationImprovement }) {
  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-4">
      <h4 className="text-sm font-semibold text-orange-900">{item.title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-orange-800">{item.reason}</p>
      <blockquote className="mt-3 rounded-md border border-orange-200 bg-white px-3 py-2 text-sm italic text-orange-900">
        「{item.userQuote}」
      </blockquote>
      <p className="mt-3 text-xs font-medium text-blue-700">模範回答</p>
      <p className="mt-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm leading-relaxed text-blue-900">
        {item.modelAnswer}
      </p>
    </div>
  );
}

export function EvaluationDetail({ evaluation }: EvaluationDetailProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-base font-semibold text-zinc-800">総評</h3>
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-800">
          {evaluation.summary}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-violet-800">女性心理</h3>
        <p className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm leading-relaxed text-violet-900">
          {evaluation.femalePsychology}
        </p>
      </section>

      <EvaluationCharacterSection evaluation={evaluation} />

      <section>
        <h3 className="mb-3 text-base font-semibold text-orange-800">改善ポイント</h3>
        <div className="space-y-3">
          {evaluation.improvements.map((item, index) => (
            <ImprovementCard key={index} item={item} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-indigo-800">次回の課題</h3>
        <ol className="space-y-2">
          {evaluation.nextChallenges.map((challenge, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{challenge}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
