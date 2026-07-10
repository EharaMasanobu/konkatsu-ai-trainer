import type { EmotionState, RelationshipState } from "./engine/ai-state";
import type { FemaleEmotionKey, FemaleEmotionState } from "./engine/emotion";
import type { ConversationQualitySnapshot } from "./engine/conversation-quality";
import type { FlowState } from "./engine/flow";
import type { ReplyType } from "./engine/reply";
import type { HomeForm } from "./homeForm";
import type { ConversationHistoryMessage } from "./conversation";

export interface SessionPayload {
  sessionId: string;
  createdAt: string;
  homeForm: HomeForm;
}

export interface MessageRequest {
  message: string;
  session: SessionPayload;
  conversationHistory: ConversationHistoryMessage[];
}

export interface AIStateDebugSnapshot {
  relationship: RelationshipState;
  emotion: EmotionState;
}

export interface TopicDebugSnapshot {
  currentTopic: string;
  depth: number;
  completedTopics: string;
  nextCandidate: string | null;
}

export interface MemoryDebugItem {
  value: string;
  category: string;
  importance: number;
  scope: "short" | "long";
}

export interface MemoryDebugSnapshot {
  longTerm: MemoryDebugItem[];
  shortTerm: MemoryDebugItem[];
}

export interface EmotionDebugChange {
  field: FemaleEmotionKey;
  delta: number;
  reason: string;
}

export interface EmotionDebugSnapshot {
  state: FemaleEmotionState;
  turn: number;
  changes: EmotionDebugChange[];
}

export interface RomanceDebugSnapshot {
  turn: number;
  previousScore: number;
  newScore: number;
  delta: number;
  reasons: string[];
}

export interface FlowDebugSnapshot {
  turn: number;
  state: FlowState;
  reasons: string[];
  shouldEndConversation: boolean;
  expectedReplyType: ReplyType;
}

export interface TurnSummaryDebugSnapshot {
  turn: number;
  emotionChanges: Array<{ field: FemaleEmotionKey; delta: number }>;
  romance: { previous: number; current: number; delta: number };
  flow: { state: FlowState; reasons: string[] };
  replyType: ReplyType;
  topic: { current: string; shiftTarget: string | null };
  conversationQuality: ConversationQualitySnapshot;
}

export interface MessageResponse {
  reply: string;
  shouldEnd: boolean;
  turn: number;
  debugState?: AIStateDebugSnapshot;
  debugTopic?: TopicDebugSnapshot;
  debugMemory?: MemoryDebugSnapshot;
  debugEmotion?: EmotionDebugSnapshot;
  debugRomance?: RomanceDebugSnapshot;
  debugFlow?: FlowDebugSnapshot;
  debugTurnSummary?: TurnSummaryDebugSnapshot;
  debugPromptPreview?: string;
}
