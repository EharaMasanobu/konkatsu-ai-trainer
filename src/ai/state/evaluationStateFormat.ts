import type { AIState } from "@/ai/state/AIState";
import { getHiddenGoalEnum } from "@/ai/state/AIState";
import { getHiddenGoalDescription } from "@/ai/state/HiddenGoal";

export function formatAIStateForEvaluationPrompt(aiState?: AIState): {
  hidden_goal: string;
  interest: string;
  comfort: string;
  trust: string;
  romance: string;
  happy: string;
  curious: string;
  nervous: string;
  conversation_count: string;
} {
  if (!aiState) {
    return {
      hidden_goal: "（情報なし）",
      interest: "50",
      comfort: "40",
      trust: "40",
      romance: "30",
      happy: "50",
      curious: "50",
      nervous: "70",
      conversation_count: "0",
    };
  }

  return {
    hidden_goal: getHiddenGoalDescription(getHiddenGoalEnum(aiState)),
    interest: String(aiState.relationship.interest),
    comfort: String(aiState.relationship.comfort),
    trust: String(aiState.relationship.trust),
    romance: String(aiState.relationship.romance),
    happy: String(aiState.emotion.happy),
    curious: String(aiState.emotion.curious),
    nervous: String(aiState.emotion.nervous),
    conversation_count: String(aiState.conversation.turn),
  };
}
