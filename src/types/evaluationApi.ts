import type { Evaluation } from "@/types/Evaluation";
import type { HomeForm } from "@/types/homeForm";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

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
