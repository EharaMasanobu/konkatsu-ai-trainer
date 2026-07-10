import type { RomanceResult } from "@konkatsu/shared-types";

/** セッション内の恋愛状態（romanceScore は内部値） */
export interface RomanceSessionState {
  romanceScore: number;
  /** 累積の恋愛度変化理由（分析・履歴用） */
  romanceReasons: string[];
}

export const ROMANCE_SCORE_INITIAL = 50;

export function createInitialRomanceState(): RomanceSessionState {
  return {
    romanceScore: ROMANCE_SCORE_INITIAL,
    romanceReasons: [],
  };
}

export type { RomanceResult };

export interface RomanceTurnLog {
  turn: number;
  previousScore: number;
  newScore: number;
  delta: number;
  reasons: string[];
}
