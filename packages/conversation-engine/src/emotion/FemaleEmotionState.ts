/** 女性AIの感情状態（0〜100）— 将来の恋愛フラグ・デート成立等に拡張可能 */
export interface FemaleEmotionState {
  /** 安心感 */
  comfort: number;
  /** 興味 */
  interest: number;
  /** 緊張 */
  tension: number;
  /** 警戒 */
  guard: number;
  /** 疲れ */
  fatigue: number;
}

export type FemaleEmotionKey = keyof FemaleEmotionState;

export const FEMALE_EMOTION_INITIAL: FemaleEmotionState = {
  comfort: 50,
  interest: 50,
  tension: 40,
  guard: 20,
  fatigue: 0,
};

export const FEMALE_EMOTION_LABELS: Record<FemaleEmotionKey, string> = {
  comfort: "安心感",
  interest: "興味",
  tension: "緊張",
  guard: "警戒",
  fatigue: "疲れ",
};

export function clampEmotion(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function cloneFemaleEmotion(state: FemaleEmotionState): FemaleEmotionState {
  return { ...state };
}

export function createInitialFemaleEmotion(): FemaleEmotionState {
  return { ...FEMALE_EMOTION_INITIAL };
}
