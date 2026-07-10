import type { MaleMessageAnalysis, ConversationQualitySnapshot } from "@engine/conversation/MaleMessageAnalyzer";
import type { ReplyType } from "@engine/conversation/ReplyType";
import type { FemaleEmotionState } from "@engine/emotion/FemaleEmotionState";
import type { FlowState } from "@engine/flow/FlowState";
import type { LLMChatMessage } from "@engine/providers/LLMProvider";
import type { AIState } from "@engine/state/AIState";
import type { Topic } from "@engine/topic/Topic";
import type { TopicState } from "@engine/topic/TopicState";
import type { CharacterReplyStyle } from "@engine/constants/characterReplyStyles";
import type { ConversationDifficulty } from "@engine/constants/conversationDifficulty";
import type { Memory } from "@konkatsu/shared-types";
import type { ConversationHistoryMessage, Session } from "@konkatsu/shared-types";
import type { CharacterProfile } from "@konkatsu/shared-types";

export interface PromptContext {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  latestUserMessage: string;
  aiState: AIState;
  topic: TopicState;
  memories: Memory[];
  conversationDifficulty: ConversationDifficulty;
  femaleEmotion: FemaleEmotionState;
  romanceStateDescription: string;
  flowGuidance: string;
  flowState: FlowState;
  replyType: ReplyType;
  replyTypeGuidance: string;
  characterReplyStyle: CharacterReplyStyle;
  topicShiftTarget?: Topic | null;
  topicShiftTargetLabel?: string;
  maleMessageAnalysis?: MaleMessageAnalysis;
  conversationQuality?: ConversationQualitySnapshot;
}

export interface PromptSection {
  id: PromptSectionId;
  title: string;
  content: string;
}

export type PromptSectionId =
  | "role"
  | "purpose"
  | "character"
  | "characterProfile"
  | "conversationDifficulty"
  | "conversationRule"
  | "emotion"
  | "romance"
  | "flow"
  | "topic"
  | "memory"
  | "hiddenGoal"
  | "history"
  | "outputRule";

export interface PromptValidationIssue {
  code:
    | "PROMPT_TOO_LARGE"
    | "EMPTY_SECTION"
    | "DUPLICATE_MEMORY"
    | "HISTORY_LIMIT_EXCEEDED"
    | "TOPIC_MISSING";
  message: string;
  sectionId?: PromptSectionId;
}

export interface PromptValidationResult {
  valid: boolean;
  issues: PromptValidationIssue[];
  stats: {
    promptSize: number;
    sectionCount: number;
    historyTurns: number;
    memoryCount: number;
  };
}

export interface PromptBuildResult {
  messages: LLMChatMessage[];
  systemPrompt: string;
  sections: PromptSection[];
  validation: PromptValidationResult;
  characterProfile: CharacterProfile;
  preview: string;
}

export const PROMPT_LIMITS = {
  maxPromptChars: 28_000,
  maxHistoryTurns: 15,
  maxMemoriesInPrompt: 5,
} as const;
