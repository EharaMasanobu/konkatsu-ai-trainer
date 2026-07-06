import {
  applyDifficultyAdjustment,
  resolveVerdict,
  sumItemScores,
} from "@/constants/evaluationScoring";
import type { DifficultyType } from "@/constants/homeOptions";
import type { FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";
import type { RomanceResult } from "@/ai/romance/RomanceState";
import type { Evaluation, EvaluationRawResult } from "@/types/Evaluation";

export class EvaluationScoreProcessor {
  finalize(
    raw: EvaluationRawResult,
    difficulty: DifficultyType,
    femaleEmotion?: FemaleEmotionState,
    romance?: RomanceResult,
  ): Evaluation {
    const baseScore = sumItemScores(raw.itemScores);
    const score = applyDifficultyAdjustment(baseScore, difficulty);
    const difficultyAdjustment = score - baseScore;

    const { verdict, stars, bandLabel } = resolveVerdict(score);

    if (!romance) {
      throw new Error("RomanceResult is required for evaluation finalize");
    }

    return {
      score,
      baseScore,
      difficultyAdjustment,
      difficulty,
      itemScores: raw.itemScores,
      internalReasons: raw.internalReasons,
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
      finalFemaleEmotion: femaleEmotion,
      romance,
    };
  }
}
