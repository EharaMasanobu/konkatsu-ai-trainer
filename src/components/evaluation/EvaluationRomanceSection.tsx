import type { RomanceResult } from "@/ai/romance/RomanceState";

interface EvaluationRomanceSectionProps {
  romance: RomanceResult;
}

export function EvaluationRomanceSection({ romance }: EvaluationRomanceSectionProps) {
  return (
    <section className="space-y-5">
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-500">恋愛判定</p>
        <p className="mt-2 text-2xl font-bold text-violet-700 sm:text-3xl">
          {romance.verdictLabel}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          ※ 会話スコアとは別の、恋愛対象としての印象です
        </p>
      </div>

      {romance.reasons.length > 0 && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-4">
          <h3 className="text-sm font-semibold text-violet-900">理由</h3>
          <ul className="mt-2 space-y-1.5">
            {romance.reasons.map((reason) => (
              <li key={reason} className="text-sm leading-relaxed text-violet-800">
                ・{reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {romance.improvements.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
          <h3 className="text-sm font-semibold text-zinc-800">恋愛印象の改善点</h3>
          <ul className="mt-2 space-y-1.5">
            {romance.improvements.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-zinc-700">
                ・{item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
