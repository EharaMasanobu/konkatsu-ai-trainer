import type { RomanceVerdict } from "@/constants/romanceVerdict";

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

/** 評価画面・API 返却用（romanceScore は含めない） */
export interface RomanceResult {
  verdict: RomanceVerdict;
  verdictLabel: string;
  /** 恋愛判定のポジティブ理由 */
  reasons: string[];
  /** 恋愛判定の改善点 */
  improvements: string[];
  /** 内部保持の全理由（将来の分析画面用） */
  romanceReasons: string[];
}

export interface RomanceTurnLog {
  turn: number;
  previousScore: number;
  newScore: number;
  delta: number;
  reasons: string[];
}
