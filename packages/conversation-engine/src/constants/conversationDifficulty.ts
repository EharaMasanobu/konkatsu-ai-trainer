import type { FlowState } from "@engine/flow/FlowState";
import type { DifficultyType } from "@engine/constants/homeOptions";

/** 会話難易度ごとの振る舞い定義（ConversationDirector が参照） */
export interface ConversationDifficulty {
  id: DifficultyType;
  label: string;
  /** 女性が質問を含む返答をする目安割合（0〜1） */
  questionRateMax: number;
  /** 推奨返答文数 */
  responseSentences: { min: number; max: number };
  /** FlowState ごとの文数上限 */
  flowSentenceLimits: Partial<Record<FlowState, { min: number; max: number }>>;
  /** 会話を広げる積極性 */
  leadLevel: "high" | "medium" | "low";
  /** プロンプト用の振る舞い説明 */
  behaviorLines: readonly string[];
}

export const CONVERSATION_DIFFICULTY: Record<DifficultyType, ConversationDifficulty> = {
  Easy: {
    id: "Easy",
    label: "Easy（練習向け）",
    questionRateMax: 0.4,
    responseSentences: { min: 1, max: 3 },
    flowSentenceLimits: {
      NORMAL: { min: 1, max: 3 },
      SHORT_REPLY: { min: 1, max: 2 },
      QUESTION: { min: 2, max: 3 },
      TOPIC_SHIFT: { min: 2, max: 3 },
      WAITING: { min: 1, max: 1 },
      SILENCE: { min: 1, max: 1 },
    },
    leadLevel: "medium",
    behaviorLines: [
      "女性から時々質問してよい（全体の40%以下）",
      "リアクションはやや多めにしてよい",
      "男性が沈黙しそうなときだけ、軽く話題のきっかけを渡してよい",
      "それでも会話の主導権は男性側。女性がリードし続けてはいけない",
    ],
  },
  Normal: {
    id: "Normal",
    label: "Normal（現実的なお見合い）",
    questionRateMax: 0.2,
    responseSentences: { min: 1, max: 2 },
    flowSentenceLimits: {
      NORMAL: { min: 1, max: 2 },
      SHORT_REPLY: { min: 1, max: 1 },
      QUESTION: { min: 2, max: 2 },
      TOPIC_SHIFT: { min: 2, max: 2 },
      WAITING: { min: 1, max: 1 },
      SILENCE: { min: 1, max: 1 },
    },
    leadLevel: "low",
    behaviorLines: [
      "女性は必要最低限だけ話す",
      "質問は少なめ（全体の20%以下）",
      "男性が話題を広げれば会話が続く。広げなければ止まる",
      "勝手に話題を提供したり、会話を成立させようとしない",
    ],
  },
  Hard: {
    id: "Hard",
    label: "Hard（本番に近い）",
    questionRateMax: 0.05,
    responseSentences: { min: 1, max: 2 },
    flowSentenceLimits: {
      NORMAL: { min: 1, max: 2 },
      SHORT_REPLY: { min: 1, max: 1 },
      QUESTION: { min: 1, max: 2 },
      TOPIC_SHIFT: { min: 1, max: 2 },
      WAITING: { min: 1, max: 1 },
      SILENCE: { min: 1, max: 1 },
    },
    leadLevel: "low",
    behaviorLines: [
      "女性からほぼ質問しない（全体の5%以下）",
      "SHORT_REPLYは最大1文。NORMALでも補足1文までは許可",
      "男性が頑張らないと会話が沈黙する",
      "相槌・短い返事だけで終わってよい",
      "男性の質問にだけ、必要な範囲で答える",
    ],
  },
};

export function resolveConversationDifficulty(
  difficulty: DifficultyType,
): ConversationDifficulty {
  return CONVERSATION_DIFFICULTY[difficulty];
}

export function getFlowSentenceLimit(
  config: ConversationDifficulty,
  flowState: FlowState,
): { min: number; max: number } {
  return (
    config.flowSentenceLimits[flowState] ?? config.responseSentences
  );
}

export function formatConversationDifficultyPrompt(
  config: ConversationDifficulty,
): string {
  return [
    `難易度: ${config.label}`,
    `質問を含む返答の上限: 全体の${Math.round(config.questionRateMax * 100)}%以下`,
    `返答の長さ: ${config.responseSentences.min}〜${config.responseSentences.max}文`,
    "",
    "この難易度での振る舞い:",
    ...config.behaviorLines.map((line) => `- ${line}`),
  ].join("\n");
}
