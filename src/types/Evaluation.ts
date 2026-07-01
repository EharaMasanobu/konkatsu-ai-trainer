import type { AIState } from "@/ai/state/AIState";
import type { DifficultyType } from "@/constants/homeOptions";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type { Session } from "@/types/session";

export type EvaluationVerdict =
  | "ぜひまた会いたい"
  | "もう一度会ってみたい"
  | "迷う"
  | "厳しい"
  | "お断りしたい";

export interface EvaluationItemScores {
  /** 共感力（満点20） */
  empathy: number;
  /** 質問力（満点20） */
  question: number;
  /** 自己開示（満点15） */
  selfDisclosure: number;
  /** 深掘り力（満点15） */
  depth: number;
  /** 会話の自然さ（満点15） */
  naturalness: number;
  /** 婚活らしさ（満点15） */
  konkatsuFit: number;
}

export interface EvaluationImprovement {
  title: string;
  reason: string;
  /** 改善対象の男性発言（会話履歴から引用） */
  userQuote: string;
  /** 婚活でより自然な模範回答 */
  modelAnswer: string;
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
  /** 総評（改善点を重視） */
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
}

export interface EvaluationAIInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  aiState?: AIState;
}

/** LLM が返す生データ（難易度補正・判定はサーバー側） */
export interface EvaluationRawResult {
  itemScores: EvaluationItemScores;
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
