import type { CharacterReplyStyle } from "@engine/constants/characterReplyStyles";
import type { ConversationDifficulty } from "@engine/constants/conversationDifficulty";
import { getFlowSentenceLimit } from "@engine/constants/conversationDifficulty";
import type { FlowState } from "@engine/flow/FlowState";
import type { ReplyType } from "@engine/conversation/ReplyType";

export interface ReplyQualityResult {
  valid: boolean;
  replyType: ReplyType;
  issues: string[];
}

export interface ReplyQualityCheckContext {
  expectedReplyType: ReplyType;
  flowState: FlowState;
  questionAllowed: boolean;
  topicShiftAllowed: boolean;
  characterStyle: CharacterReplyStyle;
  topicShiftTargetLabel?: string;
  currentTopicLabel?: string;
  difficulty: ConversationDifficulty;
  recentReplyTypes: ReplyType[];
}

const TOPIC_SHIFT_BRIDGE_PATTERN =
  /そういえば|ところで|そういった話で|思い出しました|話ですが/;
const TOPIC_SHIFT_FORBIDDEN_PATTERN = /別の話|話変わる/;
const QUESTION_PATTERN = /[?？]/;
const REACTION_PATTERN =
  /そうなんですね|楽しそう|確かに|私も|いいですね|気になります|へー|ほー|なるほど/;
const EMOTIONAL_PATTERN = /！|大好き|すごく|めちゃ|超|わくわく|楽しい/;

const MAX_REGENERATE_ATTEMPTS = 2;

export class ReplyQualityChecker {
  get maxAttempts(): number {
    return MAX_REGENERATE_ATTEMPTS;
  }

  check(reply: string, context: ReplyQualityCheckContext): ReplyQualityResult {
    const trimmed = reply.trim();
    const issues: string[] = [];
    const replyType = this.classifyReplyType(trimmed, context);
    const sentenceCount = this.countSentences(trimmed);
    const limits = getFlowSentenceLimit(context.difficulty, context.flowState);

    if (trimmed.length === 0) {
      issues.push("返答が空です");
    }

    if (sentenceCount > limits.max + 1) {
      issues.push(`文が長すぎます（${limits.max}文以内）`);
    }

    if (trimmed.length > 150) {
      issues.push("返答全体が長すぎます");
    }

    if (!context.questionAllowed && QUESTION_PATTERN.test(trimmed)) {
      issues.push("許可されていない質問が含まれています");
    }

    if (
      !context.topicShiftAllowed &&
      TOPIC_SHIFT_BRIDGE_PATTERN.test(trimmed)
    ) {
      issues.push("許可されていない話題転換が含まれています");
    }

    if (TOPIC_SHIFT_FORBIDDEN_PATTERN.test(trimmed)) {
      issues.push("唐突な話題転換表現が含まれています");
    }

    this.checkReplyTypeRequirements(
      trimmed,
      context,
      sentenceCount,
      limits,
      issues,
    );

    if (
      context.recentReplyTypes.length >= 2 &&
      context.recentReplyTypes.slice(-2).every((type) => type === replyType)
    ) {
      issues.push("ReplyTypeが偏っています（テンポを変えてください）");
    }

    return {
      valid: issues.length === 0,
      replyType,
      issues,
    };
  }

  buildRegenerateUserMessage(
    issues: string[],
    context: ReplyQualityCheckContext,
  ): string {
    const limits = getFlowSentenceLimit(context.difficulty, context.flowState);

    return [
      "前の返答は品質基準を満たしませんでした。やり直してください。",
      "",
      "問題点:",
      ...issues.map((issue) => `- ${issue}`),
      "",
      `返答タイプ: ${context.expectedReplyType}`,
      `文数: ${limits.min}〜${limits.max}文`,
      context.topicShiftTargetLabel
        ? `話題転換先: ${context.topicShiftTargetLabel}（自然な繋ぎで）`
        : "",
      "女性として自然な会話文だけ返してください。",
    ]
      .filter(Boolean)
      .join("\n");
  }

  private checkReplyTypeRequirements(
    reply: string,
    context: ReplyQualityCheckContext,
    sentenceCount: number,
    limits: { min: number; max: number },
    issues: string[],
  ): void {
    const { expectedReplyType, characterStyle } = context;

    switch (expectedReplyType) {
      case "AnswerOnly":
      case "ShortReply":
      case "WaitingReply":
      case "Silence":
        if (sentenceCount > limits.max) {
          issues.push("短めの返答が必要です");
        }
        break;
      case "AnswerReaction":
        if (!REACTION_PATTERN.test(reply)) {
          issues.push("リアクションが含まれていません");
        }
        if (sentenceCount < 2) {
          issues.push("リアクション＋回答の2文構成にしてください");
        }
        break;
      case "AnswerDetail":
        if (characterStyle !== "shy" && sentenceCount < 2 && reply.length < 18) {
          issues.push("回答＋補足1文が必要です");
        }
        if (characterStyle === "shy" && sentenceCount > 2) {
          issues.push("性格に合わせて短くしてください");
        }
        break;
      case "AnswerDetailQuestion":
        if (sentenceCount < 2) {
          issues.push("回答＋補足が必要です");
        }
        if (!QUESTION_PATTERN.test(reply)) {
          issues.push("質問を1つ含めてください");
        }
        break;
      case "TopicShift":
        if (!TOPIC_SHIFT_BRIDGE_PATTERN.test(reply)) {
          issues.push(
            "「そういえば」「ところで」等の自然な繋ぎが必要です",
          );
        }
        if (sentenceCount < 2) {
          issues.push("現話題への回答後に話題転換してください");
        }
        break;
      default:
        break;
    }

    if (characterStyle === "shy" && EMOTIONAL_PATTERN.test(reply)) {
      issues.push("性格に合わせ、感情表現を控えめにしてください");
    }

    if (characterStyle === "bright" && expectedReplyType === "AnswerDetail") {
      if (!REACTION_PATTERN.test(reply) && !EMOTIONAL_PATTERN.test(reply)) {
        issues.push("明るい性格らしい自然な感情を少し加えてください");
      }
    }
  }

  private classifyReplyType(
    reply: string,
    context: ReplyQualityCheckContext,
  ): ReplyType {
    if (context.flowState === "ENDING") {
      return "Ending";
    }
    if (context.flowState === "SILENCE" || reply.length <= 6) {
      return "Silence";
    }
    if (context.expectedReplyType === "TopicShift") {
      return "TopicShift";
    }
    if (QUESTION_PATTERN.test(reply)) {
      return "AnswerDetailQuestion";
    }
    if (REACTION_PATTERN.test(reply) && this.countSentences(reply) >= 2) {
      return "AnswerReaction";
    }
    if (this.countSentences(reply) >= 2) {
      return "AnswerDetail";
    }
    if (context.flowState === "WAITING") {
      return "WaitingReply";
    }
    if (context.flowState === "SHORT_REPLY") {
      return "ShortReply";
    }
    return "AnswerOnly";
  }

  private countSentences(text: string): number {
    const parts = text
      .split(/[。！？!?]+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    return Math.max(parts.length, text.length > 0 ? 1 : 0);
  }
}
