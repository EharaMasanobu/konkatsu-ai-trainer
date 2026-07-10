import type {
  PromptContext,
  PromptSection,
  PromptValidationIssue,
  PromptValidationResult,
} from "@engine/types/PromptContext";
import { PROMPT_LIMITS } from "@engine/types/PromptContext";
import type { Memory } from "@konkatsu/shared-types";
import { Topic } from "@engine/topic/Topic";

export class PromptValidator {
  validate(
    sections: PromptSection[],
    context: PromptContext,
    memoriesForPrompt: Memory[],
    systemPrompt: string,
    historyTurns: number,
  ): PromptValidationResult {
    const issues: PromptValidationIssue[] = [];

    this.checkPromptSize(systemPrompt, issues);
    this.checkEmptySections(sections, issues);
    this.checkDuplicateMemories(memoriesForPrompt, issues);
    this.checkHistoryCount(historyTurns, issues);
    this.checkTopic(context, issues);

    return {
      valid: issues.length === 0,
      issues,
      stats: {
        promptSize: systemPrompt.length,
        sectionCount: sections.length,
        historyTurns,
        memoryCount: memoriesForPrompt.length,
      },
    };
  }

  private checkPromptSize(systemPrompt: string, issues: PromptValidationIssue[]): void {
    if (systemPrompt.length > PROMPT_LIMITS.maxPromptChars) {
      issues.push({
        code: "PROMPT_TOO_LARGE",
        message: `プロンプトサイズが上限（${PROMPT_LIMITS.maxPromptChars}文字）を超えています: ${systemPrompt.length}文字`,
      });
    }
  }

  private checkEmptySections(
    sections: PromptSection[],
    issues: PromptValidationIssue[],
  ): void {
    for (const section of sections) {
      if (!section.content.trim()) {
        issues.push({
          code: "EMPTY_SECTION",
          message: `セクション「${section.title}」が空です`,
          sectionId: section.id,
        });
      }
    }
  }

  private checkDuplicateMemories(
    memories: Memory[],
    issues: PromptValidationIssue[],
  ): void {
    const seen = new Set<string>();

    for (const memory of memories) {
      const key = memory.value.trim().toLowerCase();
      if (seen.has(key)) {
        issues.push({
          code: "DUPLICATE_MEMORY",
          message: `重複した記憶があります: ${memory.value}`,
          sectionId: "memory",
        });
      }
      seen.add(key);
    }
  }

  private checkHistoryCount(historyTurns: number, issues: PromptValidationIssue[]): void {
    if (historyTurns > PROMPT_LIMITS.maxHistoryTurns) {
      issues.push({
        code: "HISTORY_LIMIT_EXCEEDED",
        message: `会話履歴が上限（${PROMPT_LIMITS.maxHistoryTurns}ターン）を超えています: ${historyTurns}ターン`,
        sectionId: "history",
      });
    }
  }

  private checkTopic(context: PromptContext, issues: PromptValidationIssue[]): void {
    const topic = context.topic.current;
    if (!topic || !Object.values(Topic).includes(topic)) {
      issues.push({
        code: "TOPIC_MISSING",
        message: "現在の話題（Topic）が未設定または不正です",
        sectionId: "topic",
      });
    }
  }
}
