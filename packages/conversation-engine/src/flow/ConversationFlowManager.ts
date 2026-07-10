import {
  FlowDecisionEngine,
  type FlowDecideContext,
  type FlowSessionStats,
} from "@engine/flow/FlowDecisionEngine";
import type { ReplyType } from "@engine/conversation/ReplyType";
import type { FlowDecision, FlowTurnLog } from "@engine/flow/FlowState";
import { logger } from "@engine/utils/logger";

interface FlowSessionRecord extends FlowSessionStats {
  lastDecision: FlowDecision | null;
  lastLog: FlowTurnLog | null;
  recentReplyTypes: ReplyType[];
}

export class ConversationFlowManager {
  private readonly sessions = new Map<string, FlowSessionRecord>();

  constructor(
    private readonly engine: FlowDecisionEngine = new FlowDecisionEngine(),
  ) {}

  create(sessionId: string): void {
    this.sessions.set(sessionId, this.createRecord());
  }

  ensureSession(sessionId: string): void {
    if (!this.sessions.has(sessionId)) {
      this.create(sessionId);
    }
  }

  getLastDecision(sessionId: string): FlowDecision | null {
    return this.sessions.get(sessionId)?.lastDecision ?? null;
  }

  getLastLog(sessionId: string): FlowTurnLog | null {
    return this.sessions.get(sessionId)?.lastLog ?? null;
  }

  getRecentReplyTypes(sessionId: string): ReplyType[] {
    return [...(this.sessions.get(sessionId)?.recentReplyTypes ?? [])];
  }

  recordReplyType(sessionId: string, replyType: ReplyType): void {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return;
    }
    record.recentReplyTypes = [...record.recentReplyTypes, replyType].slice(-4);
  }

  decide(sessionId: string, context: FlowDecideContext): FlowDecision {
    let record = this.sessions.get(sessionId);

    if (!record) {
      this.create(sessionId);
      record = this.sessions.get(sessionId)!;
    }

    const nextTurn = record.turn + 1;
    const stats: FlowSessionStats = {
      turn: nextTurn,
      questionTurnCount: record.questionTurnCount,
      topicShiftTurnCount: record.topicShiftTurnCount,
      turnsSinceTopicShift: record.turnsSinceTopicShift,
      consecutivePassiveTurns: record.consecutivePassiveTurns,
    };

    const decision = this.engine.decide(context, stats);

    record.turn = nextTurn;
    record.questionTurnCount = stats.questionTurnCount;
    record.topicShiftTurnCount = stats.topicShiftTurnCount;
    record.turnsSinceTopicShift = stats.turnsSinceTopicShift;
    record.consecutivePassiveTurns = stats.consecutivePassiveTurns;
    record.lastDecision = decision;

    const log: FlowTurnLog = {
      turn: nextTurn,
      state: decision.state,
      reasons: decision.reasons,
      shouldEndConversation: decision.shouldEndConversation,
      expectedReplyType: decision.expectedReplyType,
    };
    record.lastLog = log;

    if (process.env.NODE_ENV === "development") {
      this.logFlowUpdate(log);
    }

    return decision;
  }

  reset(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private createRecord(): FlowSessionRecord {
    return {
      turn: 0,
      questionTurnCount: 0,
      topicShiftTurnCount: 0,
      turnsSinceTopicShift: 99,
      consecutivePassiveTurns: 0,
      recentReplyTypes: [],
      lastDecision: null,
      lastLog: null,
    };
  }

  private logFlowUpdate(log: FlowTurnLog): void {
    const reasonText = log.reasons.join(" / ") || "なし";
    logger.info(
      `Flow Turn${log.turn}: ${log.state}${log.shouldEndConversation ? " (END)" : ""} | 理由: ${reasonText}`,
    );
  }
}
