import {
  createInitialAIState,
  type AIState,
} from "@/ai/state/AIState";
import { pickRandomHiddenGoal } from "@/ai/state/HiddenGoal";
import { StateCalculator } from "@/ai/state/StateCalculator";
import { cloneAIState } from "@/ai/state/stateUtils";
import { TopicManager } from "@/ai/topic/TopicManager";
import { MemoryManager } from "@/ai/memory/MemoryManager";
import { getTopicLabel } from "@/ai/topic/Topic";
import type { TopicState } from "@/ai/topic/TopicState";

export interface StateUpdateContext {
  userMessage: string;
  assistantMessage: string;
  conversationHistory: import("@/types/promptBuilder").ConversationHistoryMessage[];
  isConversationEnd?: boolean;
}

export class AIStateManager {
  private readonly states = new Map<string, AIState>();

  constructor(
    private readonly stateCalculator: StateCalculator = new StateCalculator(),
    private readonly topicManager: TopicManager = new TopicManager(),
    private readonly memoryManager: MemoryManager = new MemoryManager(),
  ) {}

  getTopicManager(): TopicManager {
    return this.topicManager;
  }

  getMemoryManager(): MemoryManager {
    return this.memoryManager;
  }

  create(sessionId: string): AIState {
    const hiddenGoal = pickRandomHiddenGoal();
    const topicState = this.topicManager.create(sessionId);
    this.memoryManager.create(sessionId);
    const state = createInitialAIState(hiddenGoal, topicState.current);
    state.conversation.currentTopic = getTopicLabel(topicState.current);
    this.states.set(sessionId, state);
    return cloneAIState(state);
  }

  get(sessionId: string): AIState | undefined {
    const state = this.states.get(sessionId);
    return state ? cloneAIState(state) : undefined;
  }

  clone(sessionId: string): AIState | undefined {
    return this.get(sessionId);
  }

  update(sessionId: string, context: StateUpdateContext): AIState {
    const current = this.states.get(sessionId);

    if (!current) {
      throw new Error(`AIState not found for session: ${sessionId}`);
    }

    const updated = this.stateCalculator.calculate({
      currentState: current,
      userMessage: context.userMessage,
      assistantMessage: context.assistantMessage,
      conversationHistory: context.conversationHistory,
      isConversationEnd: context.isConversationEnd,
    });

    this.states.set(sessionId, updated);
    return cloneAIState(updated);
  }

  /** TopicManager の結果を AIState.conversation へ反映（計算なし） */
  applyTopicToConversation(sessionId: string, topicState: TopicState): AIState {
    const current = this.states.get(sessionId);

    if (!current) {
      throw new Error(`AIState not found for session: ${sessionId}`);
    }

    const topicLabel = getTopicLabel(topicState.current);
    const previousLabel = current.conversation.currentTopic;

    const synced: AIState = {
      ...current,
      conversation: {
        ...current.conversation,
        currentTopic: topicLabel,
        lastTopic:
          previousLabel !== topicLabel ? previousLabel : current.conversation.lastTopic,
      },
    };

    this.states.set(sessionId, synced);
    return cloneAIState(synced);
  }

  reset(sessionId: string): void {
    this.states.delete(sessionId);
    this.topicManager.reset(sessionId);
    this.memoryManager.clear(sessionId);
  }
}
