import type { FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";
import type { FlowDecision, FlowState } from "@/ai/flow/FlowState";
import { formatFlowStateForPrompt } from "@/ai/flow/FlowPromptFormatter";
import type { ConversationDifficulty } from "@/constants/conversationDifficulty";
import type {
  ConversationStyleType,
  PersonalityType,
} from "@/constants/homeOptions";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

export interface FlowDecideContext {
  emotion: FemaleEmotionState;
  romanceScore: number;
  conversationHistory: ConversationHistoryMessage[];
  userMessage: string;
  difficulty: ConversationDifficulty;
  personality: PersonalityType;
  conversationStyle: ConversationStyleType;
  currentTurn: number;
  maxTurn: number;
}

export interface FlowSessionStats {
  turn: number;
  questionTurnCount: number;
  topicShiftTurnCount: number;
  turnsSinceTopicShift: number;
  consecutivePassiveTurns: number;
}

const QUESTION_PATTERN =
  /[?？]|どんな|どう|なぜ|いつ|どこ|誰|何が|何を|ますか|ですか/;

const ACTIVE_PERSONALITIES = new Set<PersonalityType>(["明るい", "活発", "天然"]);

export class FlowDecisionEngine {
  decide(
    context: FlowDecideContext,
    stats: FlowSessionStats,
  ): FlowDecision {
    const reasons: string[] = [];

    const endDecision = this.checkEndConditions(context, stats, reasons);
    if (endDecision) {
      return endDecision;
    }

    const state = this.resolvePrimaryState(context, stats, reasons);

    return this.buildDecision(state, context, stats, reasons);
  }

  private checkEndConditions(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): FlowDecision | null {
    const { emotion, romanceScore, currentTurn, maxTurn } = context;

    if (currentTurn >= maxTurn) {
      reasons.push("ターン数上限");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (emotion.fatigue >= 80) {
      reasons.push("疲れが80以上");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (emotion.guard >= 90) {
      reasons.push("警戒が90以上");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (romanceScore <= 20) {
      reasons.push("恋愛度が極端に低い");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (stats.consecutivePassiveTurns >= 4) {
      reasons.push("長時間の受け身・沈黙が続いた");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    return null;
  }

  private resolvePrimaryState(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): FlowState {
    const { emotion, romanceScore, userMessage, difficulty, personality, conversationStyle } =
      context;

    if (emotion.guard >= 75 || emotion.fatigue >= 70) {
      reasons.push("警戒または疲れが高い");
      return emotion.guard >= 85 ? "SILENCE" : "SHORT_REPLY";
    }

    const trimmed = userMessage.trim();
    if (trimmed.length < 5) {
      reasons.push("男性の発言が極端に短い");
      return "SILENCE";
    }

    if (this.isMaleMonologue(trimmed) && !QUESTION_PATTERN.test(trimmed)) {
      reasons.push("男性が自分の話を続けた");
      if (emotion.comfort < 55 || romanceScore < 45) {
        return "WAITING";
      }
      return "SHORT_REPLY";
    }

    if (emotion.comfort < 45 || romanceScore < 35) {
      reasons.push("安心感・恋愛度が低い");
      if (!this.recentMaleAskedQuestion(context.conversationHistory)) {
        reasons.push("質問不足");
        return "WAITING";
      }
      return "SHORT_REPLY";
    }

    if (this.shouldTopicShift(context, stats, reasons)) {
      return "TOPIC_SHIFT";
    }

    if (this.shouldQuestion(context, stats, reasons)) {
      return "QUESTION";
    }

    if (emotion.comfort >= 75 && romanceScore >= 60) {
      reasons.push("安心感・恋愛度が高い");
      return "NORMAL";
    }

    if (emotion.comfort < 60) {
      reasons.push("まだ様子見");
      return difficulty.id === "Hard" ? "WAITING" : "SHORT_REPLY";
    }

    reasons.push("標準的な会話継続");
    return "NORMAL";
  }

  private shouldQuestion(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): boolean {
    const { emotion, romanceScore, difficulty } = context;
    const totalTurns = Math.max(stats.turn, 1);
    const currentRate = stats.questionTurnCount / totalTurns;

    if (currentRate >= difficulty.questionRateMax) {
      return false;
    }

    if (emotion.comfort < 60 || emotion.interest < 55) {
      return false;
    }

    if (romanceScore < 50 && difficulty.id !== "Easy") {
      return false;
    }

    const threshold =
      difficulty.id === "Easy" ? 0.35 : difficulty.id === "Normal" ? 0.12 : 0.03;

    const interestBonus =
      emotion.interest >= 75 && romanceScore >= 65 ? 0.15 : 0;

    if (Math.random() > threshold + interestBonus) {
      return false;
    }

    reasons.push("興味・安心感があり質問許容範囲内");
    return true;
  }

  private shouldTopicShift(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): boolean {
    const { emotion, romanceScore, personality, conversationStyle } = context;

    if (emotion.comfort < 70 || romanceScore < 60) {
      return false;
    }

    const isActive =
      ACTIVE_PERSONALITIES.has(personality) || conversationStyle === "よく話す";

    if (!isActive) {
      return false;
    }

    if (stats.turnsSinceTopicShift < 6) {
      return false;
    }

    if (Math.random() > 0.07) {
      return false;
    }

    reasons.push("安心感・恋愛度が高く積極的性格");
    return true;
  }

  private buildDecision(
    state: FlowState,
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): FlowDecision {
    const questionAllowed = state === "QUESTION";
    const topicShiftAllowed = state === "TOPIC_SHIFT";

    if (state === "QUESTION") {
      stats.questionTurnCount += 1;
    }
    if (state === "TOPIC_SHIFT") {
      stats.topicShiftTurnCount += 1;
      stats.turnsSinceTopicShift = 0;
    } else {
      stats.turnsSinceTopicShift += 1;
    }

    if (["SILENCE", "WAITING", "SHORT_REPLY"].includes(state)) {
      stats.consecutivePassiveTurns += 1;
    } else {
      stats.consecutivePassiveTurns = 0;
    }

    return this.makeDecision(
      state,
      reasons,
      false,
      context,
      stats,
      questionAllowed,
      topicShiftAllowed,
    );
  }

  private makeDecision(
    state: FlowState,
    reasons: string[],
    shouldEndConversation: boolean,
    _context: FlowDecideContext,
    _stats: FlowSessionStats,
    questionAllowed = state === "QUESTION",
    topicShiftAllowed = state === "TOPIC_SHIFT",
  ): FlowDecision {
    return {
      state,
      reasons,
      shouldEndConversation,
      promptGuidance: formatFlowStateForPrompt(state),
      questionAllowed,
      topicShiftAllowed,
    };
  }

  private isMaleMonologue(message: string): boolean {
    return message.length >= 90 && /私は|僕は|自分は|俺は/.test(message);
  }

  private recentMaleAskedQuestion(
    history: ConversationHistoryMessage[],
  ): boolean {
    const recentUser = history
      .filter((entry) => entry.role === "user")
      .slice(-2)
      .map((entry) => entry.content);

    return recentUser.some((text) => QUESTION_PATTERN.test(text));
  }
}
