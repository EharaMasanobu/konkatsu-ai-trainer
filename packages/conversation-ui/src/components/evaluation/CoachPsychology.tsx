import type { CoachFemalePsychology } from "@konkatsu/shared-types";

const PSYCHOLOGY_LABELS: Record<keyof CoachFemalePsychology, string> = {
  interest: "興味度",
  comfort: "安心感",
  trust: "信頼",
  romance: "恋愛対象",
  nextDate: "また会いたい度",
};

interface CoachPsychologyProps {
  psychology: CoachFemalePsychology;
}

function PsychologyBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-700">{label}</span>
        <span className="font-semibold text-zinc-900">{value}点</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface CoachMissionProps {
  nextMission: string[];
}

export function CoachPsychology({ psychology }: CoachPsychologyProps) {
  const entries = Object.entries(PSYCHOLOGY_LABELS) as Array<
    [keyof CoachFemalePsychology, string]
  >;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-zinc-900">女性心理（推定）</h3>
      <div className="space-y-4">
        {entries.map(([key, label]) => (
          <PsychologyBar key={key} label={label} value={psychology[key]} />
        ))}
      </div>
    </section>
  );
}

export function CoachMission({ nextMission }: CoachMissionProps) {
  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-indigo-900">次回ミッション</h3>
      <ol className="space-y-3">
        {nextMission.map((mission, index) => (
          <li
            key={index}
            className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="leading-relaxed">{mission}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
