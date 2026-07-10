import type {
  EmotionDebugSnapshot,
  FlowDebugSnapshot,
  MemoryDebugSnapshot,
  RomanceDebugSnapshot,
  TopicDebugSnapshot,
  TurnSummaryDebugSnapshot,
} from "./messageApi";
import type { ConversationHistoryMessage } from "./conversation";
import type { Session } from "./session";

export interface ProcessTurnInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  userMessage: string;
}

export interface ProcessTurnResult {
  reply: string;
  shouldEnd: boolean;
  turn: number;
  debugState?: { relationship: unknown; emotion: unknown };
  debugTopic?: TopicDebugSnapshot;
  debugMemory?: MemoryDebugSnapshot;
  debugEmotion?: EmotionDebugSnapshot;
  debugRomance?: RomanceDebugSnapshot;
  debugFlow?: FlowDebugSnapshot;
  debugTurnSummary?: TurnSummaryDebugSnapshot;
  debugPromptPreview?: string;
}

export interface InitializeResult {
  aiState: unknown;
  topicState: unknown;
}

export interface FinishConversationResult {
  sessionId: string;
  finalTurn: number;
}
