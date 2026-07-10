export type FemaleEmotionKey =
  | "comfort"
  | "interest"
  | "tension"
  | "guard"
  | "fatigue";

export interface FemaleEmotionState {
  comfort: number;
  interest: number;
  tension: number;
  guard: number;
  fatigue: number;
}

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
