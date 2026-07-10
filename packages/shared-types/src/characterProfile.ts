import type { PersonalityType } from "./personalitySetting";

export interface CharacterProfile {
  personality: PersonalityType;
  traitLines: string[];
  relationshipAdjustments: string[];
  formattedPrompt: string;
}
