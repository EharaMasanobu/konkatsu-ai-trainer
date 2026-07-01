import type { PromptSection } from "@/types/PromptContext";

const SECTION_SEPARATOR = "\n\n---\n\n";

export class PromptFormatter {
  formatSection(section: PromptSection): string {
    const body = section.content.trim();
    if (!body) {
      return `## ${section.title}\n\n（なし）`;
    }
    return `## ${section.title}\n\n${body}`;
  }

  formatSections(sections: PromptSection[]): string {
    return sections.map((section) => this.formatSection(section)).join(SECTION_SEPARATOR);
  }

  formatHistoryMessages(
    history: { role: "user" | "assistant"; content: string }[],
  ): string {
    if (history.length === 0) {
      return "（まだ会話履歴はありません）";
    }

    return history
      .map((message) => {
        const label = message.role === "user" ? "男性" : "女性";
        return `**${label}**: ${message.content}`;
      })
      .join("\n\n");
  }

  formatPreview(parts: {
    systemPrompt: string;
    historyText: string;
    latestUserMessage: string;
  }): string {
    return [
      parts.systemPrompt,
      SECTION_SEPARATOR,
      "## 最新ユーザー入力（API送信）",
      "",
      parts.latestUserMessage,
      SECTION_SEPARATOR,
      "## 会話履歴（APIメッセージ列・抜粋）",
      "",
      parts.historyText,
    ].join("\n");
  }
}
