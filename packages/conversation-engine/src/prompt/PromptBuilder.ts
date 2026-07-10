import type { LLMChatMessage } from "@engine/providers/LLMProvider";

import { CharacterProfileBuilder } from "@engine/prompt/CharacterProfileBuilder";
import { PromptFormatter } from "@engine/prompt/PromptFormatter";
import { PromptSectionBuilder } from "@engine/prompt/PromptSectionBuilder";
import { PromptValidator } from "@engine/prompt/PromptValidator";
import type {
  PromptBuildResult,
  PromptContext,
  PromptSection,
} from "@engine/types/PromptContext";
import { PROMPT_LIMITS } from "@engine/types/PromptContext";
import type { ConversationHistoryMessage } from "@konkatsu/shared-types";

export class PromptBuilder {
  constructor(
    private readonly sectionBuilder: PromptSectionBuilder = new PromptSectionBuilder(),
    private readonly characterProfileBuilder: CharacterProfileBuilder = new CharacterProfileBuilder(),
    private readonly formatter: PromptFormatter = new PromptFormatter(),
    private readonly validator: PromptValidator = new PromptValidator(),
  ) {}

  build(context: PromptContext): PromptBuildResult {
    const historyForPrompt = this.sliceHistory(
      context.conversationHistory,
      PROMPT_LIMITS.maxHistoryTurns,
    );
    const historyTurns = this.countTurns(historyForPrompt);
    const memoriesForPrompt = this.selectMemories(context.memories);
    const characterProfile = this.characterProfileBuilder.build(context);

    const sections: PromptSection[] = [
      {
        id: "role",
        title: "役割",
        content: this.sectionBuilder.buildRole(),
      },
      {
        id: "purpose",
        title: "目的",
        content: this.sectionBuilder.buildPurpose(),
      },
      {
        id: "character",
        title: "AI女性設定",
        content: this.sectionBuilder.buildCharacter(context),
      },
      {
        id: "characterProfile",
        title: "人物像（性格）",
        content: characterProfile.formattedPrompt,
      },
      {
        id: "conversationDifficulty",
        title: "会話難易度",
        content: this.sectionBuilder.buildConversationDifficulty(context),
      },
      {
        id: "conversationRule",
        title: "会話ルール",
        content: this.sectionBuilder.buildConversationRule(context),
      },
      {
        id: "emotion",
        title: "現在の心理状態",
        content: this.sectionBuilder.buildEmotion(context),
      },
      {
        id: "romance",
        title: "恋愛的な距離感",
        content: this.sectionBuilder.buildRomance(context),
      },
      {
        id: "flow",
        title: "会話フロー（今ターンの返答方針）",
        content: this.sectionBuilder.buildFlow(context),
      },
      {
        id: "topic",
        title: "現在の話題",
        content: this.sectionBuilder.buildTopic(context),
      },
      {
        id: "memory",
        title: "覚えている内容",
        content: this.sectionBuilder.buildMemory(memoriesForPrompt),
      },
      {
        id: "hiddenGoal",
        title: "Hidden Goal",
        content: this.sectionBuilder.buildHiddenGoal(context),
      },
      {
        id: "history",
        title: "会話履歴",
        content: this.sectionBuilder.buildHistory(historyForPrompt),
      },
      {
        id: "outputRule",
        title: "出力ルール",
        content: this.sectionBuilder.buildOutputRule(context),
      },
    ];

    const systemSections = sections.filter((section) => section.id !== "history");
    const systemPrompt = this.formatter.formatSections(systemSections);

    const historyMessages: LLMChatMessage[] = historyForPrompt.map(
      (message) => ({
        role: message.role,
        content: message.content,
      }),
    );

    const messages: LLMChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: context.latestUserMessage },
    ];

    const validation = this.validator.validate(
      sections,
      context,
      memoriesForPrompt,
      systemPrompt,
      historyTurns,
    );

    const preview = this.formatter.formatPreview({
      systemPrompt: this.formatter.formatSections(sections),
      historyText: this.formatter.formatHistoryMessages(historyForPrompt),
      latestUserMessage: context.latestUserMessage,
    });

    return {
      messages,
      systemPrompt,
      sections,
      validation,
      characterProfile,
      preview,
    };
  }

  private selectMemories(memories: import("@konkatsu/shared-types").Memory[]) {
    return [...memories]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, PROMPT_LIMITS.maxMemoriesInPrompt);
  }

  private sliceHistory(
    history: ConversationHistoryMessage[],
    maxTurns: number,
  ): ConversationHistoryMessage[] {
    const maxMessages = maxTurns * 2;
    if (history.length <= maxMessages) {
      return history;
    }
    return history.slice(-maxMessages);
  }

  private countTurns(history: ConversationHistoryMessage[]): number {
    return history.filter((message) => message.role === "user").length;
  }
}
