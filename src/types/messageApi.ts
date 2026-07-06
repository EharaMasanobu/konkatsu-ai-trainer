import type { EmotionState, RelationshipState } from "@/ai/state/AIState";
import type { FemaleEmotionKey, FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";
import type { HomeForm } from "@/types/homeForm";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

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

import type { FlowState } from "@/ai/flow/FlowState";

export interface FlowDebugSnapshot {
  turn: number;
  state: FlowState;
  reasons: string[];
  shouldEndConversation: boolean;
}

export interface MessageResponse {
  reply: string;
  shouldEnd: boolean;
  turn: number;
  /** Development 環境のみ返却 */
  debugState?: AIStateDebugSnapshot;
  debugTopic?: TopicDebugSnapshot;
  debugMemory?: MemoryDebugSnapshot;
  debugEmotion?: EmotionDebugSnapshot;
  debugRomance?: RomanceDebugSnapshot;
  debugFlow?: FlowDebugSnapshot;
  debugPromptPreview?: string;
}
