import type { AIState } from "@/ai/state/AIState";
import type { HiddenGoal } from "@/ai/state/HiddenGoal";
import { Topic, HIDDEN_GOAL_TO_TOPIC } from "@/ai/topic/Topic";
import type { TopicState } from "@/ai/topic/TopicState";
import { TOPIC_RULE_CONFIG, type TopicRuleConfig } from "@/ai/topic/TopicRuleConfig";

export interface TopicRuleContext {
  aiState: AIState;
  topicState: TopicState;
  hiddenGoal: HiddenGoal;
  globalTurn: number;
}

export class TopicRule {
  getConfig(topic: Topic): TopicRuleConfig {
    return TOPIC_RULE_CONFIG[topic];
  }

  getMinTurns(topic: Topic): number {
    return TOPIC_RULE_CONFIG[topic].minTurns;
  }

  /** 現在話題を変更してよいか（最低ターンを満たしているか） */
  canLeaveCurrentTopic(topicState: TopicState): boolean {
    const minTurns = this.getMinTurns(topicState.current);
    return topicState.turnCount >= minTurns;
  }

  /** 候補話題を選択可能か */
  canSelectTopic(topic: Topic, context: TopicRuleContext): boolean {
    const config = this.getConfig(topic);
    const { aiState, topicState, hiddenGoal, globalTurn } = context;

    if (topicState.completed.includes(topic)) {
      return false;
    }

    if (topic === topicState.current) {
      return false;
    }

    if (config.minTrust !== undefined && aiState.relationship.trust < config.minTrust) {
      return false;
    }

    if (config.minGlobalTurn !== undefined && globalTurn < config.minGlobalTurn) {
      return false;
    }

    const goalTopic = HIDDEN_GOAL_TO_TOPIC[hiddenGoal];
    if (topic === goalTopic) {
      return true;
    }

    if (topic === Topic.MARRIAGE || topic === Topic.LOVE) {
      return aiState.relationship.trust >= (config.minTrust ?? 60);
    }

    return true;
  }

  /** 現在話題を完了すべきか */
  shouldCompleteCurrent(topicState: TopicState): boolean {
    const config = this.getConfig(topicState.current);
    const minMet = topicState.turnCount >= config.minTurns;
    const depthExceeded =
      config.maxDepth !== undefined && topicState.depth >= config.maxDepth;
    return minMet && (depthExceeded || topicState.turnCount >= config.minTurns + 1);
  }

  filterSelectableTopics(
    candidates: Topic[],
    context: TopicRuleContext,
  ): Topic[] {
    return candidates.filter((topic) => this.canSelectTopic(topic, context));
  }
}
