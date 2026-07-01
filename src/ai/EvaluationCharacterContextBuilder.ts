import type { AIState } from "@/ai/state/AIState";
import { getHiddenGoalEnum } from "@/ai/state/AIState";
import { HiddenGoal } from "@/ai/state/HiddenGoal";
import {
  CONVERSATION_STYLE_EVALUATION_RULES,
  HIDDEN_GOAL_EVALUATION_RULES,
  PERSONALITY_EVALUATION_RULES,
} from "@/constants/evaluationCharacterRules";
import type { PersonalitySetting } from "@/types/personalitySetting";

export class EvaluationCharacterContextBuilder {  build(
    personalitySetting: PersonalitySetting,
    aiState?: AIState,
  ): string {
    const { personality, conversationStyle } = personalitySetting;
    const personalityRule = PERSONALITY_EVALUATION_RULES[personality];
    const styleRule = CONVERSATION_STYLE_EVALUATION_RULES[conversationStyle];

    const hiddenGoal = aiState ? getHiddenGoalEnum(aiState) : HiddenGoal.HOBBY;
    const hiddenGoalRule =
      HIDDEN_GOAL_EVALUATION_RULES[hiddenGoal] ??
      "Hidden Goal に関連する話題へ自然に触れられていない → depth から減点";

    return [
      "# Character Aware Evaluation（性格考慮型評価）",
      "",
      "同じ返答でも、**この女性の性格・会話スタイル・Hidden Goal** に応じて評価を変えてください。",
      "一般会話の上手さではなく、「**この女性ならまた会いたいと思うか**」で採点してください。",
      "",
      "## 評価対象の女性設定",
      "",
      `- 性格: **${personality}**`,
      `- 会話スタイル: **${conversationStyle}**（${styleRule.label}）`,
      `- Hidden Goal: 上記「女性の内部目的」を参照`,
      "",
      `### 【${personality}】性格別の評価基準`,
      "",
      "期待する内容:",
      ...personalityRule.expectations.map((line) => `- ${line}`),
      "",
      "減点例:",
      ...personalityRule.deductionExamples.map((line) => `- ${line}`),
      "",
      `### 会話スタイル補正（${styleRule.label}）`,
      "",
      "期待する内容:",
      ...styleRule.expectations.map((line) => `- ${line}`),
      "",
      "減点例:",
      ...styleRule.deductionExamples.map((line) => `- ${line}`),
      "",
      "### Hidden Goal 補正",
      "",
      `- ${hiddenGoalRule}`,
      "",
      "## 採点上の注意",
      "",
      "- 話が上手でも、**性格に合っていなければ積極的に減点**してください",
      "- 同じ返答でも、明るい女性には低く、おとなしい女性には高く評価されるケースがあり得ます",
      "- `characterAdaptationScore` は性格への適合度（0〜100）を別途評価してください",
      "- 総合 `itemScores` にも性格適合の不足は反映してください",
    ].join("\n");
  }
}
