import type { AIState } from "@/ai/state/AIState";
import type { TopicState } from "@/ai/topic/TopicState";
import type { MemoryDebugSnapshot, TopicDebugSnapshot } from "@/types/messageApi";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type { Session } from "@/types/session";

export interface ProcessTurnInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  userMessage: string;
}

export interface ProcessTurnResult {
  reply: string;
  shouldEnd: boolean;
  turn: number;
  debugState?: AIState;
  debugTopic?: TopicDebugSnapshot;
  debugMemory?: MemoryDebugSnapshot;
  /** Development 環境のみ返却 */
  debugPromptPreview?: string;
}

export interface InitializeResult {
  aiState: AIState;
  topicState: TopicState;
}

export interface FinishConversationResult {
  sessionId: string;
  finalTurn: number;
}
