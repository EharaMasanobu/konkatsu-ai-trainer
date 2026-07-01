import type { AIState } from "@/ai/state/AIState";
import type { TopicState } from "@/ai/topic/TopicState";
import type { Memory } from "@/types/Memory";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type { Session } from "@/types/session";

export interface PromptContext {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  latestUserMessage: string;
  aiState: AIState;
  topic: TopicState;
  memories: Memory[];
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
  | "conversationRule"
  | "emotion"
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

import type { CharacterProfile } from "@/types/characterProfile";

export interface PromptBuildResult {
  messages: import("openai/resources/chat/completions").ChatCompletionMessageParam[];
  systemPrompt: string;
  sections: PromptSection[];
  validation: PromptValidationResult;
  /** 会話開始時に固定される人格プロファイル */
  characterProfile: CharacterProfile;
  /** Development: 送信前の全文プレビュー */
  preview: string;
}

export const PROMPT_LIMITS = {
  maxPromptChars: 28_000,
  maxHistoryTurns: 15,
  maxMemoriesInPrompt: 5,
} as const;
