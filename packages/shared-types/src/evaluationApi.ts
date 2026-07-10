import type { Evaluation } from "./Evaluation";
import type { HomeForm } from "./homeForm";
import type { ConversationHistoryMessage } from "./conversation";

export interface EvaluateRequest {
  session: {
    sessionId: string;
    createdAt: string;
    homeForm: HomeForm;
  };
  conversationHistory: ConversationHistoryMessage[];
}

export interface EvaluateResponse {
  evaluation: Evaluation;
}

export interface EvaluateErrorResponse {
  error: string;
}
