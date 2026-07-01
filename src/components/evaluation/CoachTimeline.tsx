import type { CoachTimelineEntry } from "@/types/EvaluationCoach";

interface CoachTimelineProps {
  timeline: CoachTimelineEntry[];
}

export function CoachTimeline({ timeline }: CoachTimelineProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-2 text-lg font-bold text-zinc-900">会話タイムライン</h3>
      <p className="mb-6 text-sm text-zinc-500">
        ターンごとの振り返り。なぜその評価なのかを確認できます。
      </p>

      <ol className="relative space-y-0">
        {timeline.map((entry, index) => (
          <li key={entry.turn} className="relative flex gap-4 pb-8 last:pb-0">
            {index < timeline.length - 1 && (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 bg-zinc-200"
                aria-hidden
              />
            )}

            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
              {entry.turn}
            </span>

            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Turn {entry.turn}
              </p>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <p className="text-xs font-medium text-zinc-500">あなた</p>
                <p className="mt-1 text-sm text-zinc-800">{entry.user}</p>
              </div>

              <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
                <p className="text-xs font-medium text-rose-600">女性</p>
                <p className="mt-1 text-sm text-rose-900">{entry.assistant}</p>
              </div>

              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
                <p className="text-xs font-medium text-indigo-600">コーチ評価</p>
                <p className="mt-1 text-sm leading-relaxed text-indigo-900">
                  {entry.evaluation}
                </p>
              </div>

              <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2">
                <p className="text-xs font-medium text-violet-600">女性心理</p>
                <p className="mt-1 text-sm leading-relaxed text-violet-900">
                  {entry.femaleFeeling}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
