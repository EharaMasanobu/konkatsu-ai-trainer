import { EvaluationAI, EvaluationAIError } from "@engine/EvaluationAI";
import type { EmotionManager } from "@engine/emotion/EmotionManager";
import type { RomanceManager } from "@engine/romance/RomanceManager";
import type { Evaluation, EvaluationAIInput } from "@konkatsu/shared-types";
import type { LLMProvider } from "@engine/providers/LLMProvider";

export class EvaluationManager {
  constructor(
    private readonly evaluationAI: EvaluationAI,
    private readonly emotionManager?: EmotionManager,
    private readonly romanceManager?: RomanceManager,
  ) {}

  static create(
    llmProvider: LLMProvider,
    emotionManager?: EmotionManager,
    romanceManager?: RomanceManager,
  ): EvaluationManager {
    return new EvaluationManager(
      new EvaluationAI(llmProvider),
      emotionManager,
      romanceManager,
    );
  }

  async evaluate(input: EvaluationAIInput): Promise<Evaluation> {
    const sessionId = input.session.sessionId;
    const femaleEmotion =
      input.femaleEmotion ?? this.emotionManager?.get(sessionId);
    const romance =
      input.romance ?? this.romanceManager?.buildFinalResult(sessionId);

    if (!romance) {
      throw new EvaluationAIError("??????????????");
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
