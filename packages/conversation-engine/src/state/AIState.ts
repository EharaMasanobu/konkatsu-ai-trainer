import type { HiddenGoal } from "@engine/state/HiddenGoal";
import { getTopicLabel, Topic } from "@engine/topic/Topic";

export interface RelationshipState {
  interest: number;
  trust: number;
  comfort: number;
  romance: number;
}

export interface EmotionState {
  happy: number;
  curious: number;
  nervous: number;
  surprised: number;
}

export interface ConversationState {
  turn: number;
  currentTopic: string;
  lastTopic?: string;
}

export interface HiddenGoalState {
  type: string;
  completed: boolean;
  priority: number;
}

export interface AIState {
  relationship: RelationshipState;
  emotion: EmotionState;
  conversation: ConversationState;
  hiddenGoal: HiddenGoalState;
}

export const RELATIONSHIP_INITIAL: RelationshipState = {
  interest: 50,
  trust: 40,
  comfort: 40,
  romance: 30,
};

export const EMOTION_INITIAL: EmotionState = {
  happy: 50,
  curious: 50,
  nervous: 70,
  surprised: 30,
};

export function clampScore(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function createInitialAIState(
  hiddenGoalType: HiddenGoal,
  currentTopic: Topic = Topic.SELF_INTRODUCTION,
): AIState {
  return {
    relationship: { ...RELATIONSHIP_INITIAL },
    emotion: { ...EMOTION_INITIAL },
    conversation: {
      turn: 0,
      currentTopic: getTopicLabel(currentTopic),
    },
    hiddenGoal: {
      type: hiddenGoalType,
      completed: false,
      priority: 1,
    },
  };
}

/** MVP互換: HiddenGoal Enum として取得 */
export function getHiddenGoalEnum(state: AIState): HiddenGoal {
  return state.hiddenGoal.type as HiddenGoal;
}

/** MVP互換: 会話ターン数 */
export function getConversationTurn(state: AIState): number {
  return state.conversation.turn;
}
