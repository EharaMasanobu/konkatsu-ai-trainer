import type { AIState } from "@/ai/state/AIState";
import type { FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";
import type { RomanceResult } from "@/ai/romance/RomanceState";
import type { DifficultyType } from "@/constants/homeOptions";import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type { Session } from "@/types/session";

export type EvaluationVerdict =
  | "ぜひまた会いたい"
  | "もう一度会ってみたい"
  | "まあまあ良い印象"
  | "普通"
  | "厳しい"
  | "お断りしたい";

/** Version3: 女性視点の評価軸 */
export interface EvaluationItemScores {
  /** 安心感（満点15） */
  senseOfSecurity: number;
  /** 話しやすさ（満点15） */
  easeOfTalking: number;
  /** 自然さ（満点15） */
  naturalness: number;
  /** 質問力（満点15） */
  questionSkill: number;
  /** 共感力（満点15） */
  empathy: number;
  /** 押し付け感の無さ（満点15） */
  nonPushiness: number;
  /** また会いたいと思えたか（満点10） */
  wouldMeetAgain: number;
}

export interface EvaluationImprovement {
  title: string;
  reason: string;
  /** 改善対象の男性発言（会話履歴から引用） */
  userQuote: string;
  /** 婚活でより自然な模範回答 */
  modelAnswer: string;
}

/** 採点・加点・減点の内部理由（将来のレーダーチャート・履歴・分析画面用） */
export interface EvaluationReasonEntry {
  category: keyof EvaluationItemScores | "overall";
  type: "bonus" | "deduction";
  points: number;
  reason: string;
  /** 会話からの具体的引用 */
  conversationQuote: string;
}

export interface EvaluationInternalReasons {
  /** 採点理由（総合判断の根拠） */
  scoringReasons: EvaluationReasonEntry[];
  /** 加点理由 */
  bonusReasons: EvaluationReasonEntry[];
  /** 減点理由 */
  deductionReasons: EvaluationReasonEntry[];
}

export interface Evaluation {
  /** 難易度補正後の総合点（0〜100） */
  score: number;
  /** 項目合計の素点（難易度補正前） */
  baseScore: number;
  /** 適用した難易度補正値 */
  difficultyAdjustment: number;
  difficulty: DifficultyType;
  itemScores: EvaluationItemScores;
  /** 採点・加点・減点の内部データ */
  internalReasons: EvaluationInternalReasons;
  /** 性格への適合度（0〜100） */
  characterAdaptationScore: number;
  /** 性格適合の星評価（1〜5） */
  characterAdaptationStars: number;
  /** 性格適合の理由 */
  characterAdaptationReason: string;
  /** 性格に合わなかった点 */
  characterMismatches: string[];
  /** このタイプの女性ともっと自然に話すには */
  howToTalkWithThisType: string;
  /** 次回意識すること（性格適合） */
  characterNextFocus: string[];
  /** 性格適合に関する総合フィードバック（表示用） */
  characterFeedback: string;
  /** 総評（会話引用を含む具体的フィードバック） */
  summary: string;
  /** 女性心理の分析（文章） */
  femalePsychology: string;
  /** 改善ポイント（模範回答付き） */
  improvements: EvaluationImprovement[];
  /** 次回の課題 */
  nextChallenges: string[];
  /** もう一度会いたい確率（0〜100%） */
  remeetProbability: number;
  verdict: EvaluationVerdict;
  /** 1〜5 の星評価 */
  stars: number;
  bandLabel: string;
  /** 会話終了時の女性感情（EmotionManager） */
  finalFemaleEmotion?: FemaleEmotionState;
  /** 恋愛判定（RomanceManager — 会話スコアとは独立） */
  romance: RomanceResult;
}

export interface EvaluationAIInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  aiState?: AIState;
  femaleEmotion?: FemaleEmotionState;
  romance?: RomanceResult;
}

/** LLM が返す生データ（難易度補正・判定はサーバー側） */
export interface EvaluationRawResult {
  itemScores: EvaluationItemScores;
  internalReasons: EvaluationInternalReasons;
  characterAdaptationScore: number;
  characterAdaptationStars: number;
  characterAdaptationReason: string;
  characterMismatches: string[];
  howToTalkWithThisType: string;
  characterNextFocus: string[];
  characterFeedback: string;
  summary: string;
  femalePsychology: string;
  improvements: EvaluationImprovement[];
  nextChallenges: string[];
  remeetProbability: number;
}
