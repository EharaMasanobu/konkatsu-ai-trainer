import type { AIState } from "@/ai/state/AIState";
import type { HiddenGoal } from "@/ai/state/HiddenGoal";
import {
  ALL_TOPICS,
  getTopicLabel,
  Topic,
} from "@/ai/topic/Topic";
import { TopicRule } from "@/ai/topic/TopicRule";
import { TopicSelector } from "@/ai/topic/TopicSelector";
import {
  cloneTopicState,
  createInitialTopicState,
  type TopicState,
} from "@/ai/topic/TopicState";
import type { TopicHistory } from "@/ai/topic/TopicHistory";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

export const MIN_TURNS_BEFORE_SAME_TOPIC = 3;

export interface TopicUpdateInput {
  aiState: AIState;
  conversationHistory: ConversationHistoryMessage[];
  hiddenGoal: HiddenGoal;
}

export interface TopicUpdateResult {
  state: TopicState;
  changed: boolean;
  nextCandidate: Topic | null;
}

export class TopicManager {
  private readonly states = new Map<string, TopicState>();

  constructor(
    private readonly topicRule: TopicRule = new TopicRule(),
    private readonly topicSelector: TopicSelector = new TopicSelector(),
  ) {}

  create(sessionId: string): TopicState {
    const state = createInitialTopicState();
    this.states.set(sessionId, state);
    return cloneTopicState(state);
  }

  getState(sessionId: string): TopicState | undefined {
    const state = this.states.get(sessionId);
    return state ? cloneTopicState(state) : undefined;
  }

  getCurrent(sessionId: string): Topic {
    const state = this.states.get(sessionId);
    if (!state) {
      throw new Error(`TopicState not found for session: ${sessionId}`);
    }
    return state.current;
  }

  change(sessionId: string, newTopic: Topic): TopicState {
    const state = this.states.get(sessionId);
    if (!state) {
      throw new Error(`TopicState not found for session: ${sessionId}`);
    }

    if (state.current === newTopic) {
      return cloneTopicState(state);
    }

    const updated: TopicState = {
      current: newTopic,
      previous: [...state.previous, state.current],
      completed: state.completed.includes(state.current)
        ? state.completed
        : [...state.completed, state.current],
      turnCount: 0,
      depth: 1,
    };

    this.states.set(sessionId, updated);
    return cloneTopicState(updated);
  }

  complete(sessionId: string, topic?: Topic): TopicState {
    const state = this.states.get(sessionId);
    if (!state) {
      throw new Error(`TopicState not found for session: ${sessionId}`);
    }

    const target = topic ?? state.current;
    if (state.completed.includes(target)) {
      return cloneTopicState(state);
    }

    const updated: TopicState = {
      ...state,
      completed: [...state.completed, target],
    };

    this.states.set(sessionId, updated);
    return cloneTopicState(updated);
  }

  increaseDepth(sessionId: string): TopicState {
    const state = this.states.get(sessionId);
    if (!state) {
      throw new Error(`TopicState not found for session: ${sessionId}`);
    }

    const updated: TopicState = {
      ...state,
      depth: state.depth + 1,
    };

    this.states.set(sessionId, updated);
    return cloneTopicState(updated);
  }

  update(sessionId: string, input: TopicUpdateInput): TopicUpdateResult {
    const state = this.states.get(sessionId);
    if (!state) {
      throw new Error(`TopicState not found for session: ${sessionId}`);
    }

    let current: TopicState = {
      ...state,
      turnCount: state.turnCount + 1,
      depth: state.depth + 1,
    };
    this.states.set(sessionId, current);

    let changed = false;

    if (this.topicRule.shouldCompleteCurrent(current)) {
      current = this.completeInternal(sessionId, current.current);
    }

    if (this.topicRule.canLeaveCurrentTopic(current)) {
      const nextTopic = this.topicSelector.select({
        ...input,
        topicState: current,
      });

      if (nextTopic !== current.current) {
        current = this.changeInternal(sessionId, current, nextTopic);
        changed = true;
      }
    }

    const nextCandidate = this.topicSelector.pickNextCandidate({
      ...input,
      topicState: current,
    });

    return {
      state: cloneTopicState(current),
      changed,
      nextCandidate,
    };
  }

  reset(sessionId: string): void {
    this.states.delete(sessionId);
  }

  // --- MVP 互換 API ---

  getTopicHistory(sessionId: string): TopicHistory | undefined {
    const state = this.states.get(sessionId);
    if (!state) {
      return undefined;
    }
    return toTopicHistory(state);
  }

  getCurrentTopic(sessionId: string): Topic {
    return this.getCurrent(sessionId);
  }

  changeTopic(sessionId: string, newTopic: Topic): TopicHistory {
    this.change(sessionId, newTopic);
    return toTopicHistory(this.states.get(sessionId)!);
  }

  markDiscussed(sessionId: string, topic?: Topic): void {
    this.complete(sessionId, topic);
  }

  canAsk(sessionId: string, topic: Topic): boolean {
    const state = this.states.get(sessionId);
    if (!state) {
      return false;
    }
    if (topic !== state.current) {
      return true;
    }
    return state.turnCount >= this.topicRule.getMinTurns(state.current);
  }

  incrementTurnCount(sessionId: string): void {
    const state = this.states.get(sessionId);
    if (!state) {
      return;
    }
    this.states.set(sessionId, {
      ...state,
      turnCount: state.turnCount + 1,
      depth: state.depth + 1,
    });
  }

  private completeInternal(sessionId: string, topic: Topic): TopicState {
    const state = this.states.get(sessionId)!;
    if (state.completed.includes(topic)) {
      return state;
    }
    const updated = { ...state, completed: [...state.completed, topic] };
    this.states.set(sessionId, updated);
    return updated;
  }

  private changeInternal(
    sessionId: string,
    state: TopicState,
    newTopic: Topic,
  ): TopicState {
    const updated: TopicState = {
      current: newTopic,
      previous: [...state.previous, state.current],
      completed: state.completed.includes(state.current)
        ? state.completed
        : [...state.completed, state.current],
      turnCount: 0,
      depth: 1,
    };
    this.states.set(sessionId, updated);
    return updated;
  }
}

function toTopicHistory(state: TopicState): TopicHistory {
  return {
    currentTopic: state.current,
    previousTopics: state.previous,
    discussedTopics: state.completed,
    lastChangedAt: new Date(),
    topicTurnCount: state.turnCount,
  };
}

export function formatCompletedTopics(state: TopicState): string {
  if (state.completed.length === 0) {
    return "なし";
  }
  return state.completed.map((t) => getTopicLabel(t)).join("、");
}

export function getAllTopicLabels(): string[] {
  return ALL_TOPICS.map((t) => getTopicLabel(t));
}
