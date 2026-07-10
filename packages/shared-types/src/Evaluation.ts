import type { FemaleEmotionState } from "./engine/emotion";
import type { RomanceResult } from "./engine/romance";
import type { DifficultyType } from "./personalitySetting";import type { ConversationHistoryMessage } from "./conversation";
import type { Session } from "./session";

export type EvaluationVerdict =
  | "ぜひまた会いたい"
  | "もう一度会ってみたい"
  | "まあまあ良い印象"
  | "普通"
  | "厳しい"
  | "お断りしたい";

export interface EvaluationItemScores {
  senseOfSecurity: number;
  easeOfTalking: number;
  naturalness: number;
  questionSkill: number;
  empathy: number;
  nonPushiness: number;
  wouldMeetAgain: number;
}

export interface EvaluationImprovement {
  title: string;
  reason: string;
  userQuote: string;
  modelAnswer: string;
}

/** 採点・加点・減点の内部理由（将来のレーダーチャート・履歴・分析画面用） */
export interface EvaluationReasonEntry {
  category: keyof EvaluationItemScores | "overall";
  type: "bonus" | "deduction";
  points: number;
  reason: string;
  conversationQuote: string;
}

export interface EvaluationInternalReasons {
  scoringReasons: EvaluationReasonEntry[];
  bonusReasons: EvaluationReasonEntry[];
  deductionReasons: EvaluationReasonEntry[];
}

export interface Evaluation {
  score: number;
  baseScore: number;
  difficultyAdjustment: number;
  difficulty: DifficultyType;
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
  verdict: EvaluationVerdict;
  stars: number;
  bandLabel: string;
  finalFemaleEmotion?: FemaleEmotionState;
  romance: RomanceResult;
}

export interface EvaluationAIInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  aiState?: unknown;
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
