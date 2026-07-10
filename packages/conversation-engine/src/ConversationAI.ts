import type { ConversationDirector } from "@engine/ConversationDirector";
import { AIStateManager } from "@engine/state/AIStateManager";
import type { AIState } from "@engine/state/AIState";
import type { ConversationAIInput } from "@konkatsu/shared-types";
import type { MemoryDebugSnapshot, TopicDebugSnapshot } from "@konkatsu/shared-types";

export interface ConversationAIResult {
  reply: string;
  shouldEnd: boolean;
  turn: number;
  debugState?: AIState;
  debugTopic?: TopicDebugSnapshot;
  debugMemory?: MemoryDebugSnapshot;
}

export class ConversationAI {
  constructor(
    private readonly director: ConversationDirector,
    private readonly stateManager: AIStateManager,
  ) {}

  getStateManager(): AIStateManager {
    return this.stateManager;
  }

  async reply(input: ConversationAIInput): Promise<ConversationAIResult> {
    return this.director.processTurn({
      session: input.session,
      conversationHistory: input.conversationHistory,
      userMessage: input.latestMessage,
    });
  }
}
