export const PERSONALITY_OPTIONS = [
  "おとなしい",
  "明るい",
  "大人",
  "活発",
  "クール",
  "天然",
] as const;

export type PersonalityType = (typeof PERSONALITY_OPTIONS)[number];

export const CONVERSATION_STYLE_OPTIONS = [
  "聞き上手",
  "よく話す",
  "バランス型",
] as const;

export type ConversationStyleType = (typeof CONVERSATION_STYLE_OPTIONS)[number];

export const DIFFICULTY_OPTIONS = ["Easy", "Normal", "Hard"] as const;

export type DifficultyType = (typeof DIFFICULTY_OPTIONS)[number];

export const DEFAULT_MIN_TURN = 10;
export const DEFAULT_MAX_TURN = 20;
