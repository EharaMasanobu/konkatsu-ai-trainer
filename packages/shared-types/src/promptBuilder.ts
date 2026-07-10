import type { ConversationHistoryMessage } from "./conversation";
import type { Session } from "./session";

export type { ConversationHistoryMessage };

export interface ConversationAIInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  latestMessage: string;
}
