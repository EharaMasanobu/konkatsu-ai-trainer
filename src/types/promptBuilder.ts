import type { AIState } from "@/ai/state/AIState";
import type { TopicState } from "@/ai/topic/TopicState";
import type { Session } from "@/types/session";

export interface ConversationHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationAIInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  latestMessage: string;
}

export interface BuildConversationMessagesInput {
  session: Session;
  aiState: AIState;
  topicState: TopicState;
  relevantMemories: string;
  conversationHistory: ConversationHistoryMessage[];
  latestMessage: string;
}

/** @deprecated ConversationDirector 経由の BuildConversationMessagesInput を使用 */
export interface LegacyBuildConversationMessagesInput extends ConversationAIInput {
  aiState: AIState;
  topicState: TopicState;
  relevantMemories?: string;
  currentTopic?: import("@/ai/topic/Topic").Topic;
}