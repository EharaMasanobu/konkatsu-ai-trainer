import { EvaluationPromptBuilder } from "@engine/EvaluationPromptBuilder";
import { EvaluationScoreProcessor } from "@engine/EvaluationScoreProcessor";
import type { LLMProvider } from "@engine/providers/LLMProvider";
import { evaluationSchema } from "@engine/schemas/evaluationSchema";
import type { Evaluation, EvaluationAIInput, EvaluationRawResult } from "@konkatsu/shared-types";
import type { RomanceResult } from "@konkatsu/shared-types";
import { logger } from "@engine/utils/logger";
const MAX_PARSE_RETRIES = 2;

export class EvaluationAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluationAIError";
  }
}

export class EvaluationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluationParseError";
  }
}

export class EvaluationAI {
  constructor(
    private readonly llmProvider: LLMProvider,
    private readonly promptBuilder: EvaluationPromptBuilder = new EvaluationPromptBuilder(),
    private readonly scoreProcessor: EvaluationScoreProcessor = new EvaluationScoreProcessor(),
  ) {}
  async evaluate(input: EvaluationAIInput): Promise<Evaluation> {
    const messages = this.promptBuilder.buildEvaluationMessages(input);

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_PARSE_RETRIES; attempt++) {
      try {
        const raw = await this.llmProvider.chat(messages, { json: true });
        const parsed = this.parseEvaluation(raw);
        return this.scoreProcessor.finalize(
          parsed,
          input.session.homeForm.personalitySetting.difficulty,
          input.femaleEmotion,
          input.romance,
        );
      } catch (error) {        lastError = error;

        if (error instanceof EvaluationParseError && attempt < MAX_PARSE_RETRIES) {
          logger.warn(`Evaluation JSON parse failed (attempt ${attempt + 1})`, error);
          continue;
        }

        if (error instanceof EvaluationParseError) {
          throw new EvaluationAIError(
            "評価結果の解析に失敗しました。もう一度お試しください。",
          );
        }

        throw new EvaluationAIError(
          "評価の生成に失敗しました。しばらくしてからもう一度お試しください。",
        );
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new EvaluationAIError("評価の生成に失敗しました。");
  }

  private parseEvaluation(raw: string): EvaluationRawResult {    let json: unknown;

    try {
      json = JSON.parse(raw);
    } catch {
      throw new EvaluationParseError("Invalid JSON from OpenAI");
    }

    const result = evaluationSchema.safeParse(json);

    if (!result.success) {
      logger.warn("Evaluation schema validation failed", result.error.flatten());
      throw new EvaluationParseError("Evaluation JSON does not match schema");
    }

    return result.data;
  }
}
