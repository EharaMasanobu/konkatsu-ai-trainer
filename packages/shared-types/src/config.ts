import type { DifficultyType } from "./personalitySetting";

export interface ConversationConfig {
  difficulty: DifficultyType;
  emotion: {
    enabled: boolean;
    initialComfort?: number;
    initialInterest?: number;
  };
  romance: {
    enabled: boolean;
    initialScore?: number;
  };
  flow: {
    enabled: boolean;
    minTurn?: number;
    maxTurn?: number;
    endingMinTurn?: number;
  };
  topic: {
    enabled: boolean;
  };
  memory: {
    enabled: boolean;
    maxShortTerm?: number;
    maxLongTerm?: number;
  };
  prompt: {
    maxHistoryTurns?: number;
    maxMemoriesInPrompt?: number;
    maxPromptChars?: number;
  };
  llm: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export const DEFAULT_CONVERSATION_CONFIG: ConversationConfig = {
  difficulty: "Normal",
  emotion: { enabled: true },
  romance: { enabled: true },
  flow: { enabled: true, minTurn: 10, maxTurn: 20, endingMinTurn: 11 },
  topic: { enabled: true },
  memory: { enabled: true },
  prompt: {
    maxHistoryTurns: 15,
    maxMemoriesInPrompt: 5,
    maxPromptChars: 28_000,
  },
  llm: {
    temperature: 0.7,
    maxTokens: 512,
  },
};
