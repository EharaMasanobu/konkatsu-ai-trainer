import { EvaluationAI, EvaluationAIError } from "@/ai/EvaluationAI";
import type { EmotionManager } from "@/ai/emotion/EmotionManager";
import type { RomanceManager } from "@/ai/romance/RomanceManager";
import type { Evaluation, EvaluationAIInput } from "@/types/Evaluation";

/**
 * 評価のオーケストレーション。
 * 会話スコア（EvaluationAI）と恋愛判定（RomanceManager）を分離して返す。
 */
export class EvaluationManager {
  constructor(
    private readonly evaluationAI: EvaluationAI = new EvaluationAI(),
    private readonly emotionManager?: EmotionManager,
    private readonly romanceManager?: RomanceManager,
  ) {}

  async evaluate(input: EvaluationAIInput): Promise<Evaluation> {
    const sessionId = input.session.sessionId;
    const femaleEmotion =
      input.femaleEmotion ?? this.emotionManager?.get(sessionId);
    const romance =
      input.romance ?? this.romanceManager?.buildFinalResult(sessionId);

    if (!romance) {
      throw new EvaluationAIError("恋愛判定データがありません。");
    }

    return this.evaluationAI.evaluate({
      ...input,
      femaleEmotion,
      romance,
    });
  }

  getInternalReasons(evaluation: Evaluation) {
    return evaluation.internalReasons;
  }

  getFinalEmotion(evaluation: Evaluation) {
    return evaluation.finalFemaleEmotion;
  }

  getRomanceResult(evaluation: Evaluation) {
    return evaluation.romance;
  }
}

export { EvaluationAIError };
