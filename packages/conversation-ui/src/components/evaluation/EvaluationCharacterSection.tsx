import type { Evaluation } from "@konkatsu/shared-types";

function StarRating({ stars }: { stars: number }) {
  return (
    <p className="text-xl tracking-widest text-teal-600" aria-label={`${stars}つ星`}>
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
    </p>
  );
}

interface EvaluationCharacterSectionProps {
  evaluation: Evaluation;
}

export function EvaluationCharacterSection({
  evaluation,
}: EvaluationCharacterSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
      <div className="text-center">
        <h3 className="text-base font-semibold text-teal-900">性格への適合度</h3>
        <p className="mt-2 text-4xl font-bold text-teal-700">
          {evaluation.characterAdaptationScore}
          <span className="text-lg font-medium text-teal-600"> / 100</span>
        </p>
        <div className="mt-2">
          <StarRating stars={evaluation.characterAdaptationStars} />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-teal-800">
          この女性の性格にどの程度合わせられていましたか？
        </p>
        <p className="mt-1 text-sm leading-relaxed text-teal-900">
          {evaluation.characterAdaptationReason}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-teal-800">性格に合わなかった点</p>
        <ul className="mt-2 space-y-1">
          {evaluation.characterMismatches.map((item, index) => (
            <li
              key={index}
              className="rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-teal-900"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium text-teal-800">
          このタイプの女性ともっと自然に話すには
        </p>
        <p className="mt-1 text-sm leading-relaxed text-teal-900">
          {evaluation.howToTalkWithThisType}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-teal-800">次回意識すること</p>
        <ol className="mt-2 space-y-1">
          {evaluation.characterNextFocus.map((item, index) => (
            <li
              key={index}
              className="flex gap-2 rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-teal-900"
            >
              <span className="font-semibold text-teal-700">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {evaluation.characterFeedback && (
        <div className="border-t border-teal-200 pt-3">
          <p className="text-xs font-medium text-teal-800">性格適合フィードバック</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-teal-900">
            {evaluation.characterFeedback}
          </p>
        </div>
      )}
    </section>
  );
}
