import type { ConversationHistoryMessage } from "./conversation";
import type { Session } from "./session";

export interface CoachStrength {
  title: string;
  reason: string;
}

export interface CoachWeakPoint {
  title: string;
  reason: string;
  userQuote: string;
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
  aiState?: unknown;
}
