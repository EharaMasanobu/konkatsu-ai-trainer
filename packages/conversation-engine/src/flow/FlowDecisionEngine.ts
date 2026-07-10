import type { FemaleEmotionState } from "@engine/emotion/FemaleEmotionState";
import type { FlowDecision, FlowState } from "@engine/flow/FlowState";
import { formatFlowStateForPrompt } from "@engine/flow/FlowPromptFormatter";
import type { MaleMessageAnalysis } from "@engine/conversation/MaleMessageAnalyzer";
import type { ReplyType } from "@engine/conversation/ReplyType";
import type { ConversationDifficulty } from "@engine/constants/conversationDifficulty";
import { DEFAULT_MIN_TURN } from "@engine/constants/homeOptions";
import type {
  ConversationStyleType,
  PersonalityType,
} from "@engine/constants/homeOptions";
import type { ConversationHistoryMessage } from "@konkatsu/shared-types";

export interface FlowDecideContext {
  emotion: FemaleEmotionState;
  romanceScore: number;
  conversationHistory: ConversationHistoryMessage[];
  userMessage: string;
  difficulty: ConversationDifficulty;
  personality: PersonalityType;
  conversationStyle: ConversationStyleType;
  currentTurn: number;
  minTurn: number;
  maxTurn: number;
  maleAnalysis: MaleMessageAnalysis;
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

const ABUSE_PATTERN =
  /バカ|アホ|きもい|死ね|うざい|消えろ|ふざけ|馬鹿|クソ|殺す|胸|下半身|脱いで|ホテルに/;

const ACTIVE_PERSONALITIES = new Set<PersonalityType>(["明るい", "活発", "天然"]);

const ENDING_MIN_TURN = 11;

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

    let state = this.resolvePrimaryState(context, stats, reasons);
    state = this.applyEmotionTemperature(state, context, reasons);
    state = this.applyTurnPhaseBias(state, context, stats, reasons);

    return this.buildDecision(state, context, stats, reasons);
  }

  private checkEndConditions(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): FlowDecision | null {
    const { emotion, romanceScore, currentTurn, minTurn, maxTurn } = context;
    const minGuaranteed = Math.max(minTurn, DEFAULT_MIN_TURN);

    if (currentTurn >= maxTurn) {
      reasons.push("ターン数上限");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    const exceptional = this.isExceptionalEarlyEnd(context, reasons);
    if (exceptional) {
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (currentTurn < minGuaranteed) {
      return null;
    }

    if (currentTurn < ENDING_MIN_TURN) {
      return null;
    }

    if (emotion.fatigue >= 85) {
      reasons.push("疲れが85以上");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (emotion.guard >= 92) {
      reasons.push("警戒が92以上");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (romanceScore <= 15 && currentTurn >= ENDING_MIN_TURN) {
      reasons.push("恋愛度が極端に低い");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    if (stats.consecutivePassiveTurns >= 6 && currentTurn >= ENDING_MIN_TURN) {
      reasons.push("長時間の受け身・沈黙が続いた");
      return this.makeDecision("ENDING", reasons, true, context, stats);
    }

    return null;
  }

  private isExceptionalEarlyEnd(
    context: FlowDecideContext,
    reasons: string[],
  ): boolean {
    const trimmed = context.userMessage.trim();

    if (ABUSE_PATTERN.test(trimmed)) {
      reasons.push("失礼な発言・不適切な内容");
      return true;
    }

    if (this.isExtremeMonologue(trimmed)) {
      reasons.push("極端な自分語り");
      return true;
    }

    if (context.emotion.guard >= 96) {
      reasons.push("警戒が極端に高い");
      return true;
    }

    return false;
  }

  private resolvePrimaryState(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): FlowState {
    const { emotion, romanceScore, userMessage, maleAnalysis } = context;
    const warmth = this.computeConversationWarmth(emotion, romanceScore);

    if (maleAnalysis.negation) {
      reasons.push("男性の否定・否定的発言");
      return emotion.guard >= 70 ? "WAITING" : "SHORT_REPLY";
    }

    if (maleAnalysis.backchannelOnly) {
      reasons.push("男性が相槌のみ");
      return warmth < 55 ? "WAITING" : "SHORT_REPLY";
    }

    if (emotion.guard >= 80 || emotion.fatigue >= 75) {
      reasons.push("警戒または疲れが高い");
      return emotion.guard >= 88 ? "SILENCE" : "WAITING";
    }

    const trimmed = userMessage.trim();
    if (trimmed.length < 5 && warmth < 60) {
      reasons.push("男性の発言が極端に短い");
      return "SILENCE";
    }

    if (this.isMaleMonologue(trimmed) && !QUESTION_PATTERN.test(trimmed)) {
      reasons.push("男性が自分の話を続けた");
      if (maleAnalysis.selfTalk || warmth < 55) {
        return "WAITING";
      }
      return warmth >= 65 ? "NORMAL" : "SHORT_REPLY";
    }

    if (maleAnalysis.empathy) {
      reasons.push("男性の共感により会話が続きやすい");
    }

    if (warmth < 45) {
      reasons.push("会話の温度感が低い");
      if (!this.recentMaleAskedQuestion(context.conversationHistory)) {
        reasons.push("質問不足");
        return "WAITING";
      }
      return "SHORT_REPLY";
    }

    if (this.shouldTopicShift(context, stats, reasons)) {
      return "TOPIC_SHIFT";
    }

    if (maleAnalysis.topicDepth && !maleAnalysis.topicChange) {
      reasons.push("男性が話題を深掘りしている");
      return "NORMAL";
    }

    if (this.shouldQuestion(context, stats, reasons)) {
      return "QUESTION";
    }

    if (warmth >= 70) {
      reasons.push("安心感・興味が高く会話の温度感が良好");
      return "NORMAL";
    }

    reasons.push("標準的な会話継続");
    return "NORMAL";
  }

  private applyEmotionTemperature(
    state: FlowState,
    context: FlowDecideContext,
    reasons: string[],
  ): FlowState {
    const { emotion, romanceScore } = context;
    const warmth = this.computeConversationWarmth(emotion, romanceScore);

    if (
      warmth >= 68 &&
      (state === "SHORT_REPLY" || state === "SILENCE") &&
      emotion.guard < 70 &&
      emotion.fatigue < 60
    ) {
      reasons.push("温度感が高いためNORMALへ調整");
      return "NORMAL";
    }

    if (
      (emotion.guard >= 70 || emotion.fatigue >= 65) &&
      state === "NORMAL"
    ) {
      reasons.push("警戒・疲れにより受け身へ調整");
      return emotion.guard >= 78 ? "WAITING" : "SHORT_REPLY";
    }

    return state;
  }

  private applyTurnPhaseBias(
    state: FlowState,
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): FlowState {
    const { currentTurn, emotion } = context;
    const warmth = this.computeConversationWarmth(
      emotion,
      context.romanceScore,
    );

    if (currentTurn <= 3) {
      if (
        (state === "SILENCE" || state === "SHORT_REPLY") &&
        warmth >= 48 &&
        emotion.guard < 75
      ) {
        reasons.push("序盤はNORMAL/WAITING中心");
        return warmth >= 55 ? "NORMAL" : "WAITING";
      }
      if (state === "QUESTION" || state === "TOPIC_SHIFT") {
        reasons.push("序盤は質問・話題転換を抑制");
        return warmth >= 55 ? "NORMAL" : "WAITING";
      }
    }

    if (currentTurn >= 4 && currentTurn <= 7) {
      if (state === "NORMAL" && warmth >= 52 && Math.random() < 0.15) {
        reasons.push("中盤で短め返答を混ぜる");
        return "SHORT_REPLY";
      }
    }

    if (currentTurn >= 8 && currentTurn <= 10 && state === "NORMAL") {
      if (this.shouldTopicShift(context, stats, reasons)) {
        return "TOPIC_SHIFT";
      }
    }

    return state;
  }

  private computeConversationWarmth(
    emotion: FemaleEmotionState,
    romanceScore: number,
  ): number {
    return (
      emotion.comfort * 0.3 +
      emotion.interest * 0.3 +
      (100 - emotion.guard) * 0.2 +
      (100 - emotion.fatigue) * 0.1 +
      romanceScore * 0.1
    );
  }

  private shouldQuestion(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): boolean {
    const { emotion, romanceScore, difficulty, currentTurn } = context;
    const totalTurns = Math.max(stats.turn, 1);
    const currentRate = stats.questionTurnCount / totalTurns;

    if (currentRate >= difficulty.questionRateMax) {
      return false;
    }

    if (emotion.comfort < 55 || emotion.interest < 50) {
      return false;
    }

    if (currentTurn <= 3) {
      return false;
    }

    let threshold =
      difficulty.id === "Easy" ? 0.28 : difficulty.id === "Normal" ? 0.1 : 0.04;

    if (currentTurn >= 4 && currentTurn <= 7) {
      threshold += 0.06;
    }
    if (currentTurn >= 8 && currentTurn <= 10) {
      threshold += 0.04;
    }

    if (emotion.interest >= 70 && romanceScore >= 55) {
      threshold += 0.08;
    }

    if (context.maleAnalysis.openQuestion) {
      threshold += 0.06;
    }

    if (context.maleAnalysis.empathy) {
      threshold += 0.04;
    }

    if (Math.random() > threshold) {
      return false;
    }

    reasons.push("ターン帯・温度感により質問許容");
    return true;
  }

  private shouldTopicShift(
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): boolean {
    const { emotion, romanceScore, personality, conversationStyle, currentTurn } =
      context;

    if (currentTurn < 8) {
      return false;
    }

    if (emotion.comfort < 65 || romanceScore < 55) {
      return false;
    }

    const isActive =
      ACTIVE_PERSONALITIES.has(personality) || conversationStyle === "よく話す";

    if (!isActive) {
      return false;
    }

    if (stats.turnsSinceTopicShift < 5) {
      return false;
    }

    if (context.maleAnalysis.topicDepth && !context.maleAnalysis.topicChange) {
      return false;
    }

    const threshold = currentTurn >= 8 && currentTurn <= 10 ? 0.12 : 0.06;
    if (Math.random() > threshold) {
      return false;
    }

    reasons.push("終盤・温度感が高く積極的性格");
    return true;
  }

  private buildDecision(
    state: FlowState,
    context: FlowDecideContext,
    stats: FlowSessionStats,
    reasons: string[],
  ): FlowDecision {
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

    const expectedReplyType: ReplyType = "AnswerDetail";

    return this.makeDecision(
      state,
      reasons,
      false,
      context,
      stats,
      state === "QUESTION",
      state === "TOPIC_SHIFT",
      expectedReplyType,
    );
  }

  private makeDecision(
    state: FlowState,
    reasons: string[],
    shouldEndConversation: boolean,
    context: FlowDecideContext,
    _stats: FlowSessionStats,
    questionAllowed = state === "QUESTION",
    topicShiftAllowed = state === "TOPIC_SHIFT",
    expectedReplyType: ReplyType = "AnswerDetail",
  ): FlowDecision {
    return {
      state,
      reasons,
      shouldEndConversation,
      promptGuidance: formatFlowStateForPrompt(state, context.emotion),
      questionAllowed,
      topicShiftAllowed,
      expectedReplyType,
    };
  }

  private isExtremeMonologue(message: string): boolean {
    return (
      message.length >= 140 &&
      /私は|僕は|自分は|俺は/.test(message) &&
      !QUESTION_PATTERN.test(message)
    );
  }

  private isMaleMonologue(message: string): boolean {
    return message.length >= 85 && /私は|僕は|自分は|俺は/.test(message);
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
