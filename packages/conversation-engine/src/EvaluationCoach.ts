import { EvaluationCoachPromptBuilder } from "@engine/EvaluationCoachPromptBuilder";
import { OpenAIClient } from "@engine/OpenAIClient";
import { evaluationCoachSchema } from "@engine/schemas/evaluationCoachSchema";
import type {
  EvaluationCoachInput,
  EvaluationCoachResult,
} from "@konkatsu/shared-types";
import { logger } from "@engine/utils/logger";

const MAX_PARSE_RETRIES = 2;

export class EvaluationCoachError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluationCoachError";
  }
}

export class EvaluationCoachParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluationCoachParseError";
  }
}

export class EvaluationCoach {
  constructor(
    private readonly promptBuilder: EvaluationCoachPromptBuilder = new EvaluationCoachPromptBuilder(),
    private readonly openAIClient: OpenAIClient = new OpenAIClient(),
  ) {}

  async evaluate(input: EvaluationCoachInput): Promise<EvaluationCoachResult> {
    const messages = this.promptBuilder.buildCoachMessages(input);

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_PARSE_RETRIES; attempt++) {
      try {
        const raw = await this.openAIClient.chatJson(messages);
        return this.parseResult(raw);
      } catch (error) {
        lastError = error;

        if (
          error instanceof EvaluationCoachParseError &&
          attempt < MAX_PARSE_RETRIES
        ) {
          logger.warn(
            `EvaluationCoach JSON parse failed (attempt ${attempt + 1})`,
            error,
          );
          continue;
        }

        if (error instanceof EvaluationCoachParseError) {
          throw new EvaluationCoachError(
            "コーチング結果の解析に失敗しました。もう一度お試しください。",
          );
        }

        throw new EvaluationCoachError(
          "コーチング分析に失敗しました。しばらくしてからもう一度お試しください。",
        );
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new EvaluationCoachError("コーチング分析に失敗しました。");
  }

  private parseResult(raw: string): EvaluationCoachResult {
    let json: unknown;

    try {
      json = JSON.parse(raw);
    } catch {
      throw new EvaluationCoachParseError("Invalid JSON from OpenAI");
    }

    const result = evaluationCoachSchema.safeParse(json);

    if (!result.success) {
      logger.warn(
        "EvaluationCoach schema validation failed",
        result.error.flatten(),
      );
      throw new EvaluationCoachParseError(
        "EvaluationCoach JSON does not match schema",
      );
    }

    return result.data;
  }
}
