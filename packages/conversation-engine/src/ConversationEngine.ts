import type { ConversationConfig } from "@konkatsu/shared-types";
import { DEFAULT_CONVERSATION_CONFIG } from "@konkatsu/shared-types";

import { ConversationDirector } from "@engine/ConversationDirector";
import { EvaluationManager } from "@engine/EvaluationManager";
import { EmotionManager } from "@engine/emotion/EmotionManager";
import { ConversationFlowManager } from "@engine/flow/ConversationFlowManager";
import { MemoryManager } from "@engine/memory/MemoryManager";
import { PromptBuilder } from "@engine/prompt/PromptBuilder";
import type { LLMProvider } from "@engine/providers/LLMProvider";
import { OpenAIProvider } from "@engine/providers/OpenAIProvider";
import { RomanceManager } from "@engine/romance/RomanceManager";
import { AIStateManager } from "@engine/state/AIStateManager";
import { TopicManager } from "@engine/topic/TopicManager";
import type {
  FinishConversationResult,
  InitializeResult,
  ProcessTurnInput,
  ProcessTurnResult,
} from "@engine/types/conversationDirector";
import type { Evaluation } from "@konkatsu/shared-types";
import type { EvaluationAIInput } from "@konkatsu/shared-types";

export interface ConversationEngineOptions {
  config?: Partial<ConversationConfig>;
  llmProvider?: LLMProvider;
  apiKey?: string;
}

export class ConversationEngine {
  readonly config: ConversationConfig;
  readonly aiStateManager: AIStateManager;
  readonly emotionManager: EmotionManager;
  readonly romanceManager: RomanceManager;
  readonly flowManager: ConversationFlowManager;
  readonly topicManager: TopicManager;
  readonly memoryManager: MemoryManager;
  readonly promptBuilder: PromptBuilder;
  readonly evaluationManager: EvaluationManager;
  readonly director: ConversationDirector;
  readonly llmProvider: LLMProvider;

  constructor(options: ConversationEngineOptions = {}) {
    this.config = { ...DEFAULT_CONVERSATION_CONFIG, ...options.config };
    this.llmProvider =
      options.llmProvider ?? new OpenAIProvider(options.apiKey);

    this.aiStateManager = new AIStateManager();
    this.emotionManager = new EmotionManager();
    this.romanceManager = new RomanceManager();
    this.flowManager = new ConversationFlowManager();
    this.topicManager = this.aiStateManager.getTopicManager();
    this.memoryManager = this.aiStateManager.getMemoryManager();
    this.promptBuilder = new PromptBuilder();
    this.evaluationManager = EvaluationManager.create(
      this.llmProvider,
      this.emotionManager,
      this.romanceManager,
    );

    this.director = new ConversationDirector(
      this.aiStateManager,
      this.topicManager,
      this.memoryManager,
      this.emotionManager,
      this.romanceManager,
      this.flowManager,
      this.promptBuilder,
      this.llmProvider,
      this.config,
    );
  }

  initialize(sessionId: string): InitializeResult {
    return this.director.initialize(sessionId);
  }

  processTurn(input: ProcessTurnInput): Promise<ProcessTurnResult> {
    return this.director.processTurn(input);
  }

  finishConversation(sessionId: string): FinishConversationResult {
    return this.director.finishConversation(sessionId);
  }

  evaluate(input: EvaluationAIInput): Promise<Evaluation> {
    return this.evaluationManager.evaluate(input);
  }
}
