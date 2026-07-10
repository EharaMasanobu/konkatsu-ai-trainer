import type { AIState } from "@engine/state/AIState";
import type { FemaleEmotionState } from "@engine/emotion/FemaleEmotionState";
import type { TopicState } from "@engine/topic/TopicState";
import type {
  EmotionDebugSnapshot,
  FlowDebugSnapshot,
  MemoryDebugSnapshot,
  RomanceDebugSnapshot,
  TopicDebugSnapshot,
  TurnSummaryDebugSnapshot,
} from "@konkatsu/shared-types";
import type { ConversationHistoryMessage } from "@konkatsu/shared-types";
import type { Session } from "@konkatsu/shared-types";

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
  debugEmotion?: EmotionDebugSnapshot;
  debugRomance?: RomanceDebugSnapshot;
  debugFlow?: FlowDebugSnapshot;
  debugTurnSummary?: TurnSummaryDebugSnapshot;
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
