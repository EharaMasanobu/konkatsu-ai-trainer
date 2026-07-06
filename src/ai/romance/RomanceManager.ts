import type { EmotionChangeEntry } from "@/ai/emotion/EmotionUpdateRule";
import type { FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";
import { RomanceScoreCalculator } from "@/ai/romance/RomanceScoreCalculator";
import {
  createInitialRomanceState,
  type RomanceResult,
  type RomanceSessionState,
  type RomanceTurnLog,
} from "@/ai/romance/RomanceState";
import { formatRomanceStateForPrompt } from "@/ai/romance/RomancePromptFormatter";
import { resolveRomanceVerdict } from "@/constants/romanceVerdict";
import { logger } from "@/lib/logger";

interface RomanceSessionRecord extends RomanceSessionState {
  turn: number;
  lastLog: RomanceTurnLog | null;
  positiveReasons: string[];
  negativeReasons: string[];
}

export class RomanceManager {
  private readonly sessions = new Map<string, RomanceSessionRecord>();

  constructor(
    private readonly calculator: RomanceScoreCalculator = new RomanceScoreCalculator(),
  ) {}

  create(sessionId: string): RomanceSessionState {
    const record: RomanceSessionRecord = {
      ...createInitialRomanceState(),
      turn: 0,
      lastLog: null,
      positiveReasons: [],
      negativeReasons: [],
    };
    this.sessions.set(sessionId, record);
    return this.getStateSnapshot(record);
  }

  get(sessionId: string): RomanceSessionState | undefined {
    const record = this.sessions.get(sessionId);
    return record ? this.getStateSnapshot(record) : undefined;
  }

  getRomanceScore(sessionId: string): number | undefined {
    return this.sessions.get(sessionId)?.romanceScore;
  }

  getLastLog(sessionId: string): RomanceTurnLog | null {
    return this.sessions.get(sessionId)?.lastLog ?? null;
  }

  /**
   * ターン終了時: EmotionManager の状態を読み取り恋愛度を更新
   */
  updateFromEmotion(
    sessionId: string,
    emotion: FemaleEmotionState,
    emotionChanges: EmotionChangeEntry[],
  ): RomanceTurnLog {
    let record = this.sessions.get(sessionId);

    if (!record) {
      this.create(sessionId);
      record = this.sessions.get(sessionId)!;
    }

    const previousScore = record.romanceScore;
    const update = this.calculator.computeUpdate(emotion, emotionChanges);
    const nextScore = this.calculator.clampScore(previousScore + update.delta);
    const nextTurn = record.turn + 1;

    for (const reason of update.reasons) {
      record.romanceReasons.push(reason);
      if (
        reason.includes("警戒") ||
        reason.includes("疲れ") ||
        reason.includes("否定") ||
        reason.includes("多すぎ") ||
        reason.includes("一方的") ||
        reason.includes("続かな")
      ) {
        record.negativeReasons.push(reason);
      } else {
        record.positiveReasons.push(reason);
      }
    }

    const log: RomanceTurnLog = {
      turn: nextTurn,
      previousScore,
      newScore: nextScore,
      delta: nextScore - previousScore,
      reasons: update.reasons,
    };

    record.romanceScore = nextScore;
    record.turn = nextTurn;
    record.lastLog = log;

    if (process.env.NODE_ENV === "development") {
      this.logRomanceUpdate(log, update.reasons);
    }

    return log;
  }

  formatPromptGuidance(sessionId: string): string {
    const record = this.sessions.get(sessionId);
    const score = record?.romanceScore ?? createInitialRomanceState().romanceScore;
    return formatRomanceStateForPrompt(score);
  }

  /** 評価時の最終恋愛判定（会話スコアとは独立） */
  buildFinalResult(sessionId: string): RomanceResult {
    const record = this.sessions.get(sessionId) ?? {
      ...createInitialRomanceState(),
      turn: 0,
      lastLog: null,
      positiveReasons: [],
      negativeReasons: [],
    };

    const band = resolveRomanceVerdict(record.romanceScore);
    const reasons = this.pickUnique(record.positiveReasons, 3);
    const improvements = this.buildImprovements(record, band.verdict);

    if (reasons.length === 0) {
      reasons.push(...this.defaultReasonsForScore(record.romanceScore));
    }

    return {
      verdict: band.verdict,
      verdictLabel: band.label,
      reasons,
      improvements,
      romanceReasons: [...record.romanceReasons],
    };
  }

  reset(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private getStateSnapshot(record: RomanceSessionRecord): RomanceSessionState {
    return {
      romanceScore: record.romanceScore,
      romanceReasons: [...record.romanceReasons],
    };
  }

  private pickUnique(items: string[], limit: number): string[] {
    const unique: string[] = [];
    for (const item of items) {
      if (!unique.includes(item)) {
        unique.push(item);
      }
      if (unique.length >= limit) {
        break;
      }
    }
    return unique;
  }

  private buildImprovements(
    record: RomanceSessionRecord,
    verdict: RomanceResult["verdict"],
  ): string[] {
    const fromNegative = this.pickUnique(record.negativeReasons, 2).map((reason) =>
      this.negativeToImprovement(reason),
    );

    if (fromNegative.length >= 2) {
      return fromNegative.slice(0, 3);
    }

    const defaults = this.defaultImprovements(verdict);
    return [...fromNegative, ...defaults].slice(0, 3);
  }

  private negativeToImprovement(reason: string): string {
    if (reason.includes("質問が多すぎ")) {
      return "質問の量を減らし、共感と自己開示のバランスを取る";
    }
    if (reason.includes("一方的")) {
      return "自分の話ばかりにせず、相手の話を引き出す";
    }
    if (reason.includes("警戒")) {
      return "踏み込みすぎず、相手のペースに合わせる";
    }
    if (reason.includes("続かな")) {
      return "話題が止まったときに自然に次の質問へ移れると印象UP";
    }
    return `「${reason}」を避けると恋愛印象が上がりやすい`;
  }

  private defaultReasonsForScore(score: number): string[] {
    if (score >= 61) {
      return ["話を丁寧に聞いてくれた", "安心して話せた"];
    }
    if (score >= 41) {
      return ["大きな失点はなかった", "もう少し距離が縮めば良い"];
    }
    return ["第一印象は控えめ", "会話の負担を感じた場面があった"];
  }

  private defaultImprovements(verdict: RomanceResult["verdict"]): string[] {
    switch (verdict) {
      case "かなり好印象・ぜひまた会いたい":
        return ["共通点をさらに広げられるとより良い"];
      case "また会ってみたい":
        return [
          "共通点を広げられるとさらに良い",
          "終盤でもう少し自然に話題転換できると印象UP",
        ];
      case "友達としてなら":
        return [
          "恋愛対象としての特別感を伝える話題が少ない",
          "もう少し相手の価値観に触れると良い",
        ];
      case "恋愛対象ではない":
        return [
          "会話は成立しても恋愛感情は湧きにくかった",
          "距離感と話題の選び方を見直す",
        ];
      default:
        return [
          "第一印象の改善が必要",
          "相手が安心できる話し方を意識する",
        ];
    }
  }

  private logRomanceUpdate(log: RomanceTurnLog, reasons: string[]): void {
    const reasonText = reasons.join(" / ") || "変化なし";
    logger.info(
      `Romance Turn${log.turn}: ${log.previousScore}→${log.newScore} (${log.delta >= 0 ? "+" : ""}${log.delta}) | 理由: ${reasonText}`,
    );
  }
}
