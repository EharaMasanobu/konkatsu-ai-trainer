import { Topic } from "@engine/topic/Topic";

export interface TopicState {
  current: Topic;
  previous: Topic[];
  completed: Topic[];
  turnCount: number;
  depth: number;
}

export function createInitialTopicState(): TopicState {
  return {
    current: Topic.SELF_INTRODUCTION,
    previous: [],
    completed: [],
    turnCount: 0,
    depth: 1,
  };
}

export function cloneTopicState(state: TopicState): TopicState {
  return structuredClone(state);
}
