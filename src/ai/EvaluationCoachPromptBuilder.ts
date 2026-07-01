import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { formatAIStateForEvaluationPrompt } from "@/ai/state/evaluationStateFormat";
import { DIFFICULTY_BEHAVIOR } from "@/constants/difficultyBehavior";
import type { EvaluationCoachInput } from "@/types/EvaluationCoach";
import type { FemaleProfile } from "@/types/femaleProfile";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type { UserProfile } from "@/types/userProfile";

const COACH_TEMPLATE_PATH = join(
  process.cwd(),
  "src/prompts/evaluation/coach.md",
);

let cachedCoachTemplate: string | null = null;

export class EvaluationCoachPromptBuilder {
  buildCoachMessages(
    input: EvaluationCoachInput,
  ): ChatCompletionMessageParam[] {
    const systemContent = this.buildSystemPrompt(input);

    return [
      { role: "system", content: systemContent },
      {
        role: "user",
        content:
          "上記の会話を婚活コーチとして分析し、指定されたJSON形式のみで結果を返してください。timelineはユーザー発言ごとにすべてのターンを含めてください。",
      },
    ];
  }

  private buildSystemPrompt(input: EvaluationCoachInput): string {
    const { session, conversationHistory, aiState } = input;
    const { homeForm } = session;

    const stateVars = formatAIStateForEvaluationPrompt(aiState);

    return this.applyTemplate(this.loadCoachTemplate(), {
      user_profile: this.formatProfile(homeForm.userProfile),
      female_profile: this.formatProfile(homeForm.femaleProfile),
      personality: homeForm.personalitySetting.personality,
      conversation_style: homeForm.personalitySetting.conversationStyle,
      difficulty: this.formatDifficulty(homeForm.personalitySetting.difficulty),
      hidden_goal: stateVars.hidden_goal,
      interest: stateVars.interest,
      comfort: stateVars.comfort,
      empathy: stateVars.curious,
      tension: stateVars.nervous,
      satisfaction: stateVars.happy,
      conversation_count: stateVars.conversation_count,
      conversation_history: this.formatConversationHistory(conversationHistory),
    });
  }

  private loadCoachTemplate(): string {
    if (!cachedCoachTemplate) {
      cachedCoachTemplate = readFileSync(COACH_TEMPLATE_PATH, "utf-8");
    }

    return cachedCoachTemplate;
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

    let turn = 0;

    return history
      .map((message) => {
        if (message.role === "user") {
          turn += 1;
          return `[Turn ${turn}] 男性: ${message.content}`;
        }

        return `[Turn ${turn} 返答] 女性: ${message.content}`;
      })
      .join("\n\n");
  }
}
