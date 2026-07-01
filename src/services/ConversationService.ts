import type { ConversationDirector } from "@/ai/ConversationDirector";
import type {
  FinishConversationResult,
  InitializeResult,
  ProcessTurnInput,
  ProcessTurnResult,
} from "@/types/conversationDirector";

export class ConversationService {
  constructor(private readonly director: ConversationDirector) {}

  initialize(sessionId: string): InitializeResult {
    return this.director.initialize(sessionId);
  }

  async processTurn(input: ProcessTurnInput): Promise<ProcessTurnResult> {
    return this.director.processTurn(input);
  }

  finishConversation(sessionId: string): FinishConversationResult {
    return this.director.finishConversation(sessionId);
  }
}
