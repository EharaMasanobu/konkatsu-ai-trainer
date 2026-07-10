/**
 * conversation-engine 公開 API
 * React / Next.js / Prisma に依存しない純粋 TypeScript ライブラリ
 */
export { ConversationEngine } from "./ConversationEngine";
export type { ConversationEngineOptions } from "./ConversationEngine";

export { ConversationDirector } from "./ConversationDirector";
export { EmotionManager } from "./emotion/EmotionManager";
export { RomanceManager } from "./romance/RomanceManager";
export { ConversationFlowManager } from "./flow/ConversationFlowManager";
export { TopicManager } from "./topic/TopicManager";
export { EvaluationManager } from "./EvaluationManager";
export { PromptBuilder } from "./prompt/PromptBuilder";

export type { LLMProvider, LLMChatMessage, LLMChatOptions } from "./providers/LLMProvider";
export { OpenAIProvider, OpenAIClient } from "./providers/OpenAIProvider";
export { WhisperClient } from "./WhisperClient";

export type {
  ProcessTurnInput,
  ProcessTurnResult,
  InitializeResult,
  FinishConversationResult,
} from "./types/conversationDirector";

export type {
  PromptContext,
  PromptBuildResult,
  PromptSection,
} from "./types/PromptContext";

export type { FlowState, FlowDecision } from "./flow/FlowState";
export type { ReplyType } from "./conversation/ReplyType";

export type { ConversationConfig } from "@konkatsu/shared-types";
export { DEFAULT_CONVERSATION_CONFIG } from "@konkatsu/shared-types";
