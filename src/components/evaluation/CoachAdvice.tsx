import type { CoachWeakPoint, CoachStrength } from "@/types/EvaluationCoach";

interface CoachAdviceProps {
  strengths: CoachStrength[];
  weakPoints: CoachWeakPoint[];
}

export function CoachAdvice({ strengths, weakPoints }: CoachAdviceProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 text-lg font-bold text-emerald-800">強み</h3>
        <div className="space-y-4">
          {strengths.map((strength, index) => (
            <div
              key={index}
              className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"
            >
              <h4 className="font-semibold text-emerald-900">{strength.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                {strength.reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 text-lg font-bold text-amber-800">改善ポイント</h3>
        <div className="space-y-5">
          {weakPoints.map((point, index) => (
            <div
              key={index}
              className="rounded-xl border border-amber-100 bg-amber-50/40 p-4"
            >
              <h4 className="font-semibold text-amber-900">{point.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                {point.reason}
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2">
                  <p className="text-xs font-medium text-zinc-500">あなた</p>
                  <p className="mt-1 text-sm italic text-zinc-700">
                    「{point.userQuote}」
                  </p>
                </div>

                <div className="flex justify-center text-amber-600" aria-hidden>
                  ↓
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <p className="text-xs font-medium text-blue-600">模範回答</p>
                  <p className="mt-1 text-sm leading-relaxed text-blue-900">
                    {point.modelAnswer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
