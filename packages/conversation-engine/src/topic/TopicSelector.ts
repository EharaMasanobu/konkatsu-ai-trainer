import type { AIState } from "@engine/state/AIState";
import type { HiddenGoal } from "@engine/state/HiddenGoal";
import { ALL_TOPICS, HIDDEN_GOAL_TO_TOPIC, Topic, TOPIC_RELATIONS } from "@engine/topic/Topic";
import type { TopicState } from "@engine/topic/TopicState";
import { TopicRule, type TopicRuleContext } from "@engine/topic/TopicRule";
import type { ConversationHistoryMessage } from "@konkatsu/shared-types";

export interface TopicSelectorInput {
  aiState: AIState;
  conversationHistory: ConversationHistoryMessage[];
  topicState: TopicState;
  hiddenGoal: HiddenGoal;
}

const HOT_TOPIC_THRESHOLD = 60;

export class TopicSelector {
  constructor(private readonly topicRule: TopicRule = new TopicRule()) {}

  select(input: TopicSelectorInput): Topic {
    const { topicState } = input;

    if (!this.topicRule.canLeaveCurrentTopic(topicState)) {
      return topicState.current;
    }

    const candidate = this.pickNextCandidate(input);
    return candidate ?? topicState.current;
  }

  pickNextCandidate(input: TopicSelectorInput): Topic | null {
    return this.pickRelatedNextTopic(input) ?? this.pickFallbackCandidate(input);
  }

  /** 現話題から関連性の高い次話題を選ぶ（TopicShift用） */
  pickRelatedNextTopic(input: TopicSelectorInput): Topic | null {
    const { topicState } = input;
    const context = this.buildContext(input);
    const related = TOPIC_RELATIONS[topicState.current] ?? [];

    const undiscussedRelated = related.filter(
      (topic) =>
        topic !== topicState.current &&
        !topicState.completed.includes(topic) &&
        this.topicRule.canSelectTopic(topic, context),
    );

    if (undiscussedRelated.length > 0) {
      return undiscussedRelated[
        Math.floor(Math.random() * undiscussedRelated.length)
      ];
    }

    const anyRelated = related.filter(
      (topic) =>
        topic !== topicState.current &&
        this.topicRule.canSelectTopic(topic, context),
    );

    if (anyRelated.length > 0) {
      return anyRelated[Math.floor(Math.random() * anyRelated.length)];
    }

    return null;
  }

  private pickFallbackCandidate(input: TopicSelectorInput): Topic | null {
    const { aiState, topicState, hiddenGoal } = input;
    const context = this.buildContext(input);

    const goalTopic = HIDDEN_GOAL_TO_TOPIC[hiddenGoal];
    if (
      this.topicRule.canSelectTopic(goalTopic, context) &&
      goalTopic !== topicState.current
    ) {
      return goalTopic;
    }

    const undiscussed = ALL_TOPICS.filter(
      (topic) =>
        topic !== topicState.current && !topicState.completed.includes(topic),
    );
    const allowed = this.topicRule.filterSelectableTopics(undiscussed, context);
    if (allowed.length > 0) {
      return allowed[Math.floor(Math.random() * allowed.length)];
    }

    const isHot =
      aiState.relationship.interest >= HOT_TOPIC_THRESHOLD ||
      aiState.emotion.happy >= HOT_TOPIC_THRESHOLD;

    if (isHot && !topicState.completed.includes(topicState.current)) {
      return topicState.current;
    }

    const fallback = ALL_TOPICS.filter((topic) => topic !== topicState.current);
    const fallbackAllowed = this.topicRule.filterSelectableTopics(
      fallback,
      context,
    );

    if (fallbackAllowed.length === 0) {
      return null;
    }

    return fallbackAllowed[Math.floor(Math.random() * fallbackAllowed.length)];
  }

  private buildContext(input: TopicSelectorInput): TopicRuleContext {
    return {
      aiState: input.aiState,
      topicState: input.topicState,
      hiddenGoal: input.hiddenGoal,
      globalTurn: input.aiState.conversation.turn,
    };
  }
}
