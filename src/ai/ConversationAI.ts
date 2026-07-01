import type { ConversationDirector } from "@/ai/ConversationDirector";
import { AIStateManager } from "@/ai/state/AIStateManager";
import type { AIState } from "@/ai/state/AIState";
import type { ConversationAIInput } from "@/types/promptBuilder";
import type { MemoryDebugSnapshot, TopicDebugSnapshot } from "@/types/messageApi";

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
