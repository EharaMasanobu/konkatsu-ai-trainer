import type { HomeForm } from "./homeForm";

export interface ConversationSession {
  sessionId: string;
  createdAt: Date;
  homeForm: HomeForm;
  currentTurn: number;
  status: "active" | "ended";
}

export interface ConversationTurn {
  turn: number;
  userMessage: string;
  assistantReply: string;
  shouldEnd: boolean;
}

export interface ConversationResult {
  sessionId: string;
  finalTurn: number;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ConversationHistoryMessage {
  role: "user" | "assistant";
  content: string;
}
