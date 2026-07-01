import type { PersonalityType } from "@/constants/homeOptions";

/** 会話開始時に固定される人格プロファイル（ターン中は変更しない） */
export interface CharacterProfile {
  personality: PersonalityType;
  /** 話し方・リアクション・質問傾向などの具体記述 */
  traitLines: string[];
  /** Interest / Trust / Comfort に基づく微調整（基本人格は維持） */
  relationshipAdjustments: string[];
  /** プロンプトへ埋め込む自然文 */
  formattedPrompt: string;
}
