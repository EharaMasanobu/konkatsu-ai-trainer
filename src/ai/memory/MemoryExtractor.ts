import { MemoryRule } from "@/ai/memory/MemoryRule";
import type { MemoryExtractionCandidate } from "@/ai/memory/MemoryRule";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

export interface MemoryExtractorInput {
  userMessage: string;
  assistantMessage: string;
  conversationHistory: ConversationHistoryMessage[];
  currentTurn: number;
}

export class MemoryExtractor {
  constructor(private readonly memoryRule: MemoryRule = new MemoryRule()) {}

  extract(input: MemoryExtractorInput): MemoryExtractionCandidate[] {
    const fromLatest = this.memoryRule.extractFromText(input.userMessage);

    const recentUserMessages = [
      ...input.conversationHistory
        .filter((m) => m.role === "user")
        .slice(-2)
        .map((m) => m.content),
      input.userMessage,
    ];

    const fromHistory: MemoryExtractionCandidate[] = [];
    const seen = new Set(fromLatest.map((c) => `${c.category}:${c.value}`));

    for (const text of recentUserMessages) {
      for (const candidate of this.memoryRule.extractFromText(text)) {
        const key = `${candidate.category}:${candidate.value}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        fromHistory.push(candidate);
      }
    }

    return [...fromLatest, ...fromHistory.filter(
      (c) => !fromLatest.some(
        (l) => l.category === c.category && l.value === c.value,
      ),
    )];
  }
}
