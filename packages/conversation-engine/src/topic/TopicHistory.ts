import { Topic } from "@engine/topic/Topic";

export interface TopicHistory {
  currentTopic: Topic;
  previousTopics: Topic[];
  discussedTopics: Topic[];
  lastChangedAt: Date;
  topicTurnCount: number;
}

export function createInitialTopicHistory(): TopicHistory {
  return {
    currentTopic: Topic.SELF_INTRODUCTION,
    previousTopics: [],
    discussedTopics: [],
    lastChangedAt: new Date(),
    topicTurnCount: 0,
  };
}
