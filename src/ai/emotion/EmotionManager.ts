import {
  cloneFemaleEmotion,
  createInitialFemaleEmotion,
  type FemaleEmotionState,
} from "@/ai/emotion/FemaleEmotionState";
import {
  EmotionUpdateRule,
  type EmotionChangeEntry,
  type EmotionUpdateContext,
} from "@/ai/emotion/EmotionUpdateRule";
import {
  formatFemaleEmotionForEvaluation,
  formatFemaleEmotionForPrompt,
} from "@/ai/emotion/EmotionPromptFormatter";
import type { ConversationDifficulty } from "@/constants/conversationDifficulty";
import { logger } from "@/lib/logger";

export interface EmotionTurnLog {
  turn: number;
  changes: EmotionChangeEntry[];
  state: FemaleEmotionState;
}

interface EmotionSessionRecord {
  state: FemaleEmotionState;
  turn: number;
  lastLog: EmotionTurnLog | null;
}

export class EmotionManager {
  private readonly sessions = new Map<string, EmotionSessionRecord>();

  constructor(
    private readonly updateRule: EmotionUpdateRule = new EmotionUpdateRule(),
  ) {}

  create(sessionId: string): FemaleEmotionState {
    const record: EmotionSessionRecord = {
      state: createInitialFemaleEmotion(),
      turn: 0,
      lastLog: null,
    };
    this.sessions.set(sessionId, record);
    return cloneFemaleEmotion(record.state);
  }

  get(sessionId: string): FemaleEmotionState | undefined {
    const record = this.sessions.get(sessionId);
    return record ? cloneFemaleEmotion(record.state) : undefined;
  }

  getLastLog(sessionId: string): EmotionTurnLog | null {
    return this.sessions.get(sessionId)?.lastLog ?? null;
  }

  /**
   * 男性発言を受けて感情を更新（返答生成前に呼ぶ）
   */
  update(sessionId: string, context: EmotionUpdateContext): EmotionTurnLog {
    let record = this.sessions.get(sessionId);

    if (!record) {
      this.create(sessionId);
      record = this.sessions.get(sessionId)!;
    }

    const nextTurn = record.turn + 1;
    const changes = this.updateRule.evaluate(context);
    const nextState = this.updateRule.applyChanges(record.state, changes);

    const log: EmotionTurnLog = {
      turn: nextTurn,
      changes,
      state: cloneFemaleEmotion(nextState),
    };

    record.state = nextState;
    record.turn = nextTurn;
    record.lastLog = log;

    if (process.env.NODE_ENV === "development") {
      this.logEmotionUpdate(log);
    }

    return log;
  }

  formatPromptGuidance(
    state: FemaleEmotionState,
    difficulty: ConversationDifficulty,
  ): string {
    return formatFemaleEmotionForPrompt(state, difficulty);
  }

  formatForEvaluation(state?: FemaleEmotionState): Record<string, string> {
    return formatFemaleEmotionForEvaluation(state);
  }

  reset(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private logEmotionUpdate(log: EmotionTurnLog): void {
    const changeSummary = log.changes
      .map((change) => `${change.field} ${change.delta >= 0 ? "+" : ""}${change.delta}`)
      .join(", ");

    const reasons = log.changes.map((change) => change.reason).join(" / ");

    logger.info(
      `Emotion Turn${log.turn}: ${changeSummary || "no change"} | 理由: ${reasons || "変化なし"}`,
    );
  }
}
