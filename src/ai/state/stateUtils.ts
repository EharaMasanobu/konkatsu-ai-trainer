import {
  clampScore,
  type AIState,
  type EmotionState,
  type RelationshipState,
} from "@/ai/state/AIState";

export function clampRelationship(
  relationship: RelationshipState,
): RelationshipState {
  return {
    interest: clampScore(relationship.interest),
    trust: clampScore(relationship.trust),
    comfort: clampScore(relationship.comfort),
    romance: clampScore(relationship.romance),
  };
}

export function clampEmotion(emotion: EmotionState): EmotionState {
  return {
    happy: clampScore(emotion.happy),
    curious: clampScore(emotion.curious),
    nervous: clampScore(emotion.nervous),
    surprised: clampScore(emotion.surprised),
  };
}

export function cloneAIState(state: AIState): AIState {
  return structuredClone(state);
}

export function applyRelationshipDelta(
  current: RelationshipState,
  delta: Partial<RelationshipState>,
): RelationshipState {
  return clampRelationship({
    interest: current.interest + (delta.interest ?? 0),
    trust: current.trust + (delta.trust ?? 0),
    comfort: current.comfort + (delta.comfort ?? 0),
    romance: current.romance + (delta.romance ?? 0),
  });
}

export function applyEmotionDelta(
  current: EmotionState,
  delta: Partial<EmotionState>,
): EmotionState {
  return clampEmotion({
    happy: current.happy + (delta.happy ?? 0),
    curious: current.curious + (delta.curious ?? 0),
    nervous: Math.max(15, current.nervous + (delta.nervous ?? 0)),
    surprised: current.surprised + (delta.surprised ?? 0),
  });
}
