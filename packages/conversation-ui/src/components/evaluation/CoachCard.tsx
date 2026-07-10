import { CoachAdvice } from "../evaluation/CoachAdvice";
import { CoachMission, CoachPsychology } from "../evaluation/CoachPsychology";
import { CoachSummary } from "../evaluation/CoachSummary";
import { CoachTimeline } from "../evaluation/CoachTimeline";
import { buttonPrimaryClassName } from "../ui/buttonStyles";
import type { EvaluationCoachResult } from "@konkatsu/shared-types";

interface CoachCardProps {
  coach: EvaluationCoachResult;
  onBackHome: () => void;
}

export function CoachCard({ coach, onBackHome }: CoachCardProps) {
  return (
    <article className="space-y-4 pb-4 sm:space-y-6 sm:pb-8">
      <header className="pt-2 text-center">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">婚活コーチング</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          なぜその評価なのか、どう改善すれば良いのかを学べます
        </p>
      </header>

      <CoachSummary coach={coach} />
      <CoachAdvice strengths={coach.strengths} weakPoints={coach.weakPoints} />
      <CoachTimeline timeline={coach.timeline} />
      <CoachPsychology psychology={coach.femalePsychology} />
      <CoachMission nextMission={coach.nextMission} />

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
