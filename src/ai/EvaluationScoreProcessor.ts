import {
  applyDifficultyAdjustment,
  resolveVerdict,
  sumItemScores,
} from "@/constants/evaluationScoring";
import type { DifficultyType } from "@/constants/homeOptions";
import type { Evaluation, EvaluationRawResult } from "@/types/Evaluation";

export class EvaluationScoreProcessor {
  finalize(
    raw: EvaluationRawResult,
    difficulty: DifficultyType,
  ): Evaluation {
    const baseScore = sumItemScores(raw.itemScores);
    const difficultyAdjustment = applyDifficultyAdjustment(baseScore, difficulty) - baseScore;
    const score = applyDifficultyAdjustment(baseScore, difficulty);
    const { verdict, stars, bandLabel } = resolveVerdict(score);

    return {
      score,
      baseScore,
      difficultyAdjustment,
      difficulty,
      itemScores: raw.itemScores,
      characterAdaptationScore: raw.characterAdaptationScore,
      characterAdaptationStars: raw.characterAdaptationStars,
      characterAdaptationReason: raw.characterAdaptationReason,
      characterMismatches: raw.characterMismatches,
      howToTalkWithThisType: raw.howToTalkWithThisType,
      characterNextFocus: raw.characterNextFocus,
      characterFeedback: raw.characterFeedback,
      summary: raw.summary,
      femalePsychology: raw.femalePsychology,
      improvements: raw.improvements,
      nextChallenges: raw.nextChallenges,
      remeetProbability: raw.remeetProbability,
      verdict,
      stars,
      bandLabel,
    };
  }
}
