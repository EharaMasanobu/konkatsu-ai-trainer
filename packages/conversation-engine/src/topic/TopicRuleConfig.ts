import { Topic } from "@engine/topic/Topic";

export interface TopicRuleConfig {
  minTurns: number;
  minTrust?: number;
  minGlobalTurn?: number;
  maxDepth?: number;
}

export const TOPIC_RULE_CONFIG: Record<Topic, TopicRuleConfig> = {
  [Topic.SELF_INTRODUCTION]: { minTurns: 2, maxDepth: 3 },
  [Topic.WORK]: { minTurns: 3, maxDepth: 4 },
  [Topic.COMMUTE]: { minTurns: 2, maxDepth: 3 },
  [Topic.HOLIDAY]: { minTurns: 2, maxDepth: 3 },
  [Topic.HOBBY]: { minTurns: 2, maxDepth: 4 },
  [Topic.FOOD]: { minTurns: 2, maxDepth: 3 },
  [Topic.TRAVEL]: { minTurns: 2, maxDepth: 3 },
  [Topic.FAMILY]: { minTurns: 3, minTrust: 50, maxDepth: 4 },
  [Topic.VALUES]: { minTurns: 3, minTrust: 45, maxDepth: 4 },
  [Topic.MARRIAGE]: { minTurns: 2, minTrust: 60, maxDepth: 3 },
  [Topic.LOVE]: { minTurns: 2, minTrust: 55, minGlobalTurn: 8, maxDepth: 3 },
  [Topic.FUTURE]: { minTurns: 2, minTrust: 50, maxDepth: 3 },
  [Topic.LIFESTYLE]: { minTurns: 2, maxDepth: 3 },
  [Topic.PET]: { minTurns: 2, maxDepth: 2 },
  [Topic.OTHER]: { minTurns: 1, maxDepth: 2 },
};
