import type { LLMChatMessage } from "@engine/providers/LLMProvider";
import type { AIState } from "@engine/state/AIState";

import { formatAIStateForEvaluationPrompt } from "@engine/state/evaluationStateFormat";
import { formatFemaleEmotionForEvaluation } from "@engine/emotion/EmotionPromptFormatter";
import { EvaluationCharacterContextBuilder } from "@engine/EvaluationCharacterContextBuilder";
import { DIFFICULTY_BEHAVIOR } from "@engine/constants/difficultyBehavior";
import { EVALUATION_SYSTEM_TEMPLATE } from "@engine/prompts/evaluation/systemTemplate";
import type { EvaluationAIInput, FemaleProfile, UserProfile } from "@konkatsu/shared-types";
import type { ConversationHistoryMessage } from "@konkatsu/shared-types";

export class EvaluationPromptBuilder {
  constructor(
    private readonly characterContextBuilder: EvaluationCharacterContextBuilder = new EvaluationCharacterContextBuilder(),
  ) {}

  buildEvaluationMessages(
    input: EvaluationAIInput,
  ): LLMChatMessage[] {
    const systemContent = this.buildSystemPrompt(input);

    return [
      { role: "system", content: systemContent },
      {
        role: "user",
        content:
          "上記の会話履歴を評価し、指定されたJSON形式のみで結果を返してください。",
      },
    ];
  }

  private buildSystemPrompt(input: EvaluationAIInput): string {
    const { session, conversationHistory } = input;
    const { homeForm } = session;

    const stateVars = formatAIStateForEvaluationPrompt(
      input.aiState as AIState | undefined,
    );
    const emotionVars = formatFemaleEmotionForEvaluation(input.femaleEmotion);

    return this.applyTemplate(EVALUATION_SYSTEM_TEMPLATE, {
      user_profile: this.formatProfile(homeForm.userProfile),
      female_profile: this.formatProfile(homeForm.femaleProfile),
      personality: homeForm.personalitySetting.personality,
      conversation_style: homeForm.personalitySetting.conversationStyle,
      difficulty: this.formatDifficulty(homeForm.personalitySetting.difficulty),
      hidden_goal: stateVars.hidden_goal,
      character_evaluation_context: this.characterContextBuilder.build(
        homeForm.personalitySetting,
        input.aiState as AIState | undefined,
      ),
      interest: stateVars.interest,
      comfort: stateVars.comfort,
      trust: stateVars.trust,
      romance: stateVars.romance,
      conversation_count: stateVars.conversation_count,
      female_emotion_comfort: emotionVars.female_emotion_comfort,
      female_emotion_interest: emotionVars.female_emotion_interest,
      female_emotion_tension: emotionVars.female_emotion_tension,
      female_emotion_guard: emotionVars.female_emotion_guard,
      female_emotion_fatigue: emotionVars.female_emotion_fatigue,
      female_emotion_context: emotionVars.female_emotion_context,
      conversation_history: this.formatConversationHistory(conversationHistory),
    });
  }

  private applyTemplate(
    template: string,
    variables: Record<string, string>,
  ): string {
    return Object.entries(variables).reduce(
      (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
      template,
    );
  }

  private formatProfile(profile: UserProfile | FemaleProfile): string {
    const hobbies =
      profile.hobbies.length > 0 ? profile.hobbies.join("、") : "未入力";

    return [
      `年齢: ${profile.age || "未入力"}`,
      `趣味: ${hobbies}`,
      `仕事: ${profile.job || "未入力"}`,
      `居住地: ${profile.location || "未入力"}`,
      `その他: ${profile.otherInfo || "未入力"}`,
    ].join("\n");
  }

  private formatDifficulty(
    difficulty: keyof typeof DIFFICULTY_BEHAVIOR,
  ): string {
    return `${difficulty}\n${DIFFICULTY_BEHAVIOR[difficulty]}`;
  }

  private formatConversationHistory(
    history: ConversationHistoryMessage[],
  ): string {
    if (history.length === 0) {
      return "（会話履歴なし）";
    }

    return history
      .map((message) => {
        const speaker = message.role === "user" ? "男性" : "女性";
        return `${speaker}: ${message.content}`;
      })
      .join("\n\n");
  }
}
