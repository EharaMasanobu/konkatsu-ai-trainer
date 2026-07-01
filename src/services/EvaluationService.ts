import type { Evaluation } from "@/types/Evaluation";
import type { Session } from "@/types/session";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type {
  EvaluateErrorResponse,
  EvaluateResponse,
} from "@/types/evaluationApi";

export interface EvaluateInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
}

export class EvaluationService {
  async evaluate(input: EvaluateInput): Promise<Evaluation> {
    const body = {
      session: {
        sessionId: input.session.sessionId,
        createdAt: input.session.createdAt.toISOString(),
        homeForm: input.session.homeForm,
      },
      conversationHistory: input.conversationHistory,
    };

    let response: Response;

    try {
      response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error("ネットワークエラーが発生しました。接続を確認してください。");
    }

    if (!response.ok) {
      let message = "コーチング分析の取得に失敗しました";

      try {
        const errorBody = (await response.json()) as EvaluateErrorResponse;
        if (errorBody.error) {
          message = errorBody.error;
        }
      } catch {
        // ignore JSON parse errors
      }

      throw new Error(message);
    }

    const data = (await response.json()) as EvaluateResponse;
    return data.evaluation;
  }
}
