export type DifficultyType = "Easy" | "Normal" | "Hard";

export type PersonalityType =
  | "おとなしい"
  | "明るい"
  | "大人"
  | "活発"
  | "クール"
  | "天然";

export type ConversationStyleType = "聞き上手" | "よく話す" | "バランス型";

export interface PersonalitySetting {
  personality: PersonalityType;
  conversationStyle: ConversationStyleType;
  difficulty: DifficultyType;
}
