import type { AIState } from "@/ai/state/AIState";
import { EmotionRule } from "@/ai/state/EmotionRule";
import { RelationshipRule } from "@/ai/state/RelationshipRule";
import {
  applyEmotionDelta,
  applyRelationshipDelta,
} from "@/ai/state/stateUtils";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

export interface StateCalculatorInput {
  currentState: AIState;
  userMessage: string;
  assistantMessage: string;
  conversationHistory: ConversationHistoryMessage[];
  isConversationEnd?: boolean;
}

export class StateCalculator {
  constructor(
    private readonly relationshipRule: RelationshipRule = new RelationshipRule(),
    private readonly emotionRule: EmotionRule = new EmotionRule(),
  ) {}

  calculate(input: StateCalculatorInput): AIState {
    const {
      currentState,
      userMessage,
      assistantMessage,
      isConversationEnd = false,
    } = input;

    const relationshipDelta = this.relationshipRule.evaluate({
      userMessage,
      assistantMessage,
      isConversationEnd,
    });

    const emotionDelta = this.emotionRule.evaluate({
      userMessage,
      assistantMessage,
    });

    const previousTopic = currentState.conversation.currentTopic;

    return {
      ...currentState,
      relationship: applyRelationshipDelta(
        currentState.relationship,
        relationshipDelta,
      ),
      emotion: applyEmotionDelta(currentState.emotion, emotionDelta),
      conversation: {
        ...currentState.conversation,
        turn: currentState.conversation.turn + 1,
        lastTopic:
          previousTopic !== currentState.conversation.currentTopic
            ? previousTopic
            : currentState.conversation.lastTopic,
      },
    };
  }
}
