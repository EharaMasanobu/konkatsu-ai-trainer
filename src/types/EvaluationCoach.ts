import type { AIState } from "@/ai/state/AIState";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type { Session } from "@/types/session";

export interface CoachStrength {
  title: string;
  reason: string;
}

export interface CoachWeakPoint {
  title: string;
  reason: string;
  /** ユーザーが実際に言った改善余地のある発言 */
  userQuote: string;
  /** 婚活でより自然な模範回答 */
  modelAnswer: string;
}

export interface CoachTimelineEntry {
  turn: number;
  user: string;
  assistant: string;
  evaluation: string;
  femaleFeeling: string;
}

export interface CoachFemalePsychology {
  interest: number;
  comfort: number;
  trust: number;
  romance: number;
  nextDate: number;
}

export interface EvaluationCoachResult {
  totalScore: number;
  summary: string;
  strengths: CoachStrength[];
  weakPoints: CoachWeakPoint[];
  timeline: CoachTimelineEntry[];
  femalePsychology: CoachFemalePsychology;
  nextMission: string[];
}

export interface EvaluationCoachInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  aiState?: AIState;
}
