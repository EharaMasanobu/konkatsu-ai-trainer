import type { DifficultyType } from "@engine/constants/homeOptions";

/** 難易度の概要（評価プロンプト等で使用） */
export const DIFFICULTY_BEHAVIOR: Record<DifficultyType, string> = {
  Easy: "練習向け。女性は時々質問・リアクション多めだが、会話の主導は男性。",
  Normal: "現実的なお見合い。女性は必要最低限だけ話し、男性が広げれば会話が続く。",
  Hard: "本番に近い。女性はほぼ質問せず短く返す。男性が頑張らないと沈黙する。",
};
