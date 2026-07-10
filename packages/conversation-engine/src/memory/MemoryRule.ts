import {
  MemoryCategory,
  type Memory,
  type MemoryScope,
} from "@konkatsu/shared-types";

export interface MemoryExtractionCandidate {
  category: MemoryCategory;
  value: string;
  scope: MemoryScope;
  importance: number;
}

export interface ExtractionPattern {
  pattern: RegExp;
  category: MemoryCategory;
  scope: MemoryScope;
  importance: number;
  formatValue: (match: RegExpMatchArray) => string;
}

const EXTRACTION_PATTERNS: ExtractionPattern[] = [
  {
    pattern: /(.+?)を飼っています/,
    category: MemoryCategory.PET,
    scope: "long",
    importance: 75,
    formatValue: (m) => `${m[1]}を飼っている`,
  },
  {
    pattern: /(.+?)を飼ってます/,
    category: MemoryCategory.PET,
    scope: "long",
    importance: 75,
    formatValue: (m) => `${m[1]}を飼っている`,
  },
  {
    pattern: /ペットを飼っています/,
    category: MemoryCategory.PET,
    scope: "long",
    importance: 70,
    formatValue: () => "ペットを飼っている",
  },
  {
    pattern: /(.+?)が好きです/,
    category: MemoryCategory.HOBBY,
    scope: "long",
    importance: 65,
    formatValue: (m) => `${m[1]}が好き`,
  },
  {
    pattern: /(.+?)が好き/,
    category: MemoryCategory.HOBBY,
    scope: "long",
    importance: 60,
    formatValue: (m) => `${m[1]}が好き`,
  },
  {
    pattern: /旅行が好き/,
    category: MemoryCategory.TRAVEL,
    scope: "long",
    importance: 70,
    formatValue: () => "旅行が好き",
  },
  {
    pattern: /(.+?)に住んでいます/,
    category: MemoryCategory.PROFILE,
    scope: "long",
    importance: 80,
    formatValue: (m) => `${m[1]}在住`,
  },
  {
    pattern: /(.+?[都道府県])在住/,
    category: MemoryCategory.PROFILE,
    scope: "long",
    importance: 80,
    formatValue: (m) => `${m[1]}在住`,
  },
  {
    pattern: /(.+?)県に住んで/,
    category: MemoryCategory.PROFILE,
    scope: "long",
    importance: 80,
    formatValue: (m) => `${m[1]}県在住`,
  },
  {
    pattern: /(.+?)で働いています/,
    category: MemoryCategory.WORK,
    scope: "long",
    importance: 75,
    formatValue: (m) => `${m[1]}で働いている`,
  },
  {
    pattern: /(.+?)をしています/,
    category: MemoryCategory.WORK,
    scope: "long",
    importance: 70,
    formatValue: (m) => `${m[1]}の仕事`,
  },
  {
    pattern: /仕事は(.+?)です/,
    category: MemoryCategory.WORK,
    scope: "long",
    importance: 75,
    formatValue: (m) => `仕事は${m[1]}`,
  },
  {
    pattern: /(.+?)職です/,
    category: MemoryCategory.WORK,
    scope: "long",
    importance: 70,
    formatValue: (m) => `${m[1]}職`,
  },
  {
    pattern: /家族は(.+?)人/,
    category: MemoryCategory.FAMILY,
    scope: "long",
    importance: 65,
    formatValue: (m) => `家族は${m[1]}人`,
  },
  {
    pattern: /(.+?)が家族/,
    category: MemoryCategory.FAMILY,
    scope: "long",
    importance: 65,
    formatValue: (m) => `${m[1]}が家族`,
  },
  {
    pattern: /(.+?)が得意/,
    category: MemoryCategory.HOBBY,
    scope: "long",
    importance: 55,
    formatValue: (m) => `${m[1]}が得意`,
  },
  {
    pattern: /趣味は(.+?)です/,
    category: MemoryCategory.HOBBY,
    scope: "long",
    importance: 70,
    formatValue: (m) => `趣味は${m[1]}`,
  },
  {
    pattern: /(.+?)が趣味/,
    category: MemoryCategory.HOBBY,
    scope: "long",
    importance: 65,
    formatValue: (m) => `${m[1]}が趣味`,
  },
  {
    pattern: /(.+?)が好きな食べ物/,
    category: MemoryCategory.FOOD,
    scope: "long",
    importance: 60,
    formatValue: (m) => `${m[1]}が好きな食べ物`,
  },
  {
    pattern: /(.+?)が大切/,
    category: MemoryCategory.VALUE,
    scope: "long",
    importance: 70,
    formatValue: (m) => `${m[1]}を大切にしている`,
  },
  {
    pattern: /結婚は(.+?)/,
    category: MemoryCategory.LOVE,
    scope: "long",
    importance: 65,
    formatValue: (m) => `結婚観: ${m[1]}`,
  },
  {
    pattern: /恋愛は(.+?)/,
    category: MemoryCategory.LOVE,
    scope: "long",
    importance: 60,
    formatValue: (m) => `恋愛観: ${m[1]}`,
  },
  {
    pattern: /今日は休み/,
    category: MemoryCategory.OTHER,
    scope: "short",
    importance: 50,
    formatValue: () => "今日は休み",
  },
  {
    pattern: /今日は(.+?)です/,
    category: MemoryCategory.OTHER,
    scope: "short",
    importance: 45,
    formatValue: (m) => `今日は${m[1]}`,
  },
  {
    pattern: /昨日(.+?)へ行った/,
    category: MemoryCategory.TRAVEL,
    scope: "short",
    importance: 55,
    formatValue: (m) => `昨日${m[1]}へ行った`,
  },
  {
    pattern: /昨日(.+?)に行った/,
    category: MemoryCategory.TRAVEL,
    scope: "short",
    importance: 55,
    formatValue: (m) => `昨日${m[1]}に行った`,
  },
  {
    pattern: /昨日(.+?)した/,
    category: MemoryCategory.OTHER,
    scope: "short",
    importance: 45,
    formatValue: (m) => `昨日${m[1]}した`,
  },
  {
    pattern: /先週(.+?)した/,
    category: MemoryCategory.OTHER,
    scope: "short",
    importance: 40,
    formatValue: (m) => `先週${m[1]}した`,
  },
];

const CATEGORY_TO_TOPIC_BOOST: Partial<Record<MemoryCategory, string>> = {
  [MemoryCategory.WORK]: "WORK",
  [MemoryCategory.HOBBY]: "HOBBY",
  [MemoryCategory.FAMILY]: "FAMILY",
  [MemoryCategory.PET]: "PET",
  [MemoryCategory.FOOD]: "FOOD",
  [MemoryCategory.TRAVEL]: "TRAVEL",
  [MemoryCategory.VALUE]: "VALUES",
  [MemoryCategory.LOVE]: "LOVE",
  [MemoryCategory.PROFILE]: "SELF_INTRODUCTION",
};

export class MemoryRule {
  getPatterns(): ExtractionPattern[] {
    return EXTRACTION_PATTERNS;
  }

  extractFromText(text: string): MemoryExtractionCandidate[] {
    const normalized = text.trim();
    if (normalized.length < 4) {
      return [];
    }

    const results: MemoryExtractionCandidate[] = [];
    const seen = new Set<string>();

    for (const rule of EXTRACTION_PATTERNS) {
      const match = normalized.match(rule.pattern);
      if (!match) {
        continue;
      }

      const value = rule.formatValue(match).trim();
      const key = `${rule.category}:${value}`;
      if (seen.has(key) || value.length < 2) {
        continue;
      }

      seen.add(key);
      results.push({
        category: rule.category,
        value,
        scope: rule.scope,
        importance: rule.importance,
      });
    }

    return results;
  }

  shouldAdd(
    candidate: MemoryExtractionCandidate,
    existing: Memory[],
  ): boolean {
    if (candidate.value.length < 2) {
      return false;
    }

    return !existing.some((memory) => this.isDuplicate(memory, candidate));
  }

  isDuplicate(memory: Memory, candidate: MemoryExtractionCandidate): boolean {
    if (memory.category !== candidate.category) {
      return false;
    }

    const a = this.normalizeValue(memory.value);
    const b = this.normalizeValue(candidate.value);

    return a === b || a.includes(b) || b.includes(a);
  }

  scoreRelevance(
    memory: Memory,
    context: { currentTopic?: string; currentTurn: number },
  ): number {
    let score = memory.importance;

    const topicKey = CATEGORY_TO_TOPIC_BOOST[memory.category];
    if (topicKey && context.currentTopic === topicKey) {
      score += 15;
    }

    const turnsSinceRef = context.currentTurn - memory.lastReferencedTurn;
    if (turnsSinceRef <= 2) {
      score += 10;
    } else if (turnsSinceRef > 6) {
      score -= 5;
    }

    return score;
  }

  normalizeValue(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, "");
  }

  formatForPrompt(memories: Memory[]): string {
    if (memories.length === 0) {
      return "（まだ覚えていることはありません）";
    }

    return memories.map((m) => `・${m.value}`).join("\n");
  }
}
