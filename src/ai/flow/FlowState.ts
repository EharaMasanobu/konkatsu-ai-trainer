/** 会話フロー状態 — 将来のデート中会話・価値観イベント等に拡張可能 */
export type FlowState =
  | "NORMAL"
  | "SHORT_REPLY"
  | "SILENCE"
  | "WAITING"
  | "QUESTION"
  | "TOPIC_SHIFT"
  | "ENDING";

export const FLOW_STATE_LABELS: Record<FlowState, string> = {
  NORMAL: "会話継続",
  SHORT_REPLY: "短く返答",
  SILENCE: "少し沈黙",
  WAITING: "待機（男性のリード待ち）",
  QUESTION: "女性から質問",
  TOPIC_SHIFT: "軽い話題転換",
  ENDING: "会話終了へ",
};

export interface FlowDecision {
  state: FlowState;
  reasons: string[];
  shouldEndConversation: boolean;
  promptGuidance: string;
  questionAllowed: boolean;
  topicShiftAllowed: boolean;
}

export interface FlowTurnLog {
  turn: number;
  state: FlowState;
  reasons: string[];
  shouldEndConversation: boolean;
}
