import type { ConversationStyleType } from "@/constants/homeOptions";
import type { DifficultyType } from "@/constants/homeOptions";
import type { PersonalityType } from "@/constants/homeOptions";

export interface PersonalitySetting {
  personality: PersonalityType;
  conversationStyle: ConversationStyleType;
  difficulty: DifficultyType;
}
