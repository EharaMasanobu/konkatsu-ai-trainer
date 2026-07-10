import type { MaleMessageAnalysis } from "@engine/conversation/MaleMessageAnalyzer";
import type { ReplyType } from "@engine/conversation/ReplyType";
import type { FlowState } from "@engine/flow/FlowState";
import type { FemaleEmotionState } from "@engine/emotion/FemaleEmotionState";
import {
  getCharacterReplyStyle,
  type CharacterReplyStyle,
} from "@engine/constants/characterReplyStyles";
import type { ConversationDifficulty } from "@engine/constants/conversationDifficulty";
import type { PersonalityType } from "@engine/constants/homeOptions";

export interface ReplyTypeResolveInput {
  flowState: FlowState;
  emotion: FemaleEmotionState;
  personality: PersonalityType;
  difficulty: ConversationDifficulty;
  recentReplyTypes: ReplyType[];
  maleAnalysis: MaleMessageAnalysis;
}

export class ReplyTypeResolver {
  resolve(input: ReplyTypeResolveInput): ReplyType {
    const style = getCharacterReplyStyle(input.personality);
    const candidates = this.getCandidates(input, style);
    const diversified = this.diversify(candidates, input.recentReplyTypes);
    return diversified[0] ?? "AnswerDetail";
  }

  private getCandidates(
    input: ReplyTypeResolveInput,
    style: CharacterReplyStyle,
  ): ReplyType[] {
    const { flowState, maleAnalysis, emotion } = input;

    switch (flowState) {
      case "ENDING":
        return ["Ending"];
      case "SILENCE":
        return ["Silence", "ShortReply"];
      case "WAITING":
        return ["WaitingReply", "AnswerOnly"];
      case "SHORT_REPLY":
        return style === "shy"
          ? ["ShortReply", "AnswerOnly"]
          : ["ShortReply", "AnswerReaction"];
      case "TOPIC_SHIFT":
        return ["TopicShift"];
      case "QUESTION":
        return ["AnswerDetailQuestion"];
      case "NORMAL":
        return this.getNormalCandidates(style, maleAnalysis, emotion);
      default:
        return ["AnswerDetail"];
    }
  }

  private getNormalCandidates(
    style: CharacterReplyStyle,
    analysis: MaleMessageAnalysis,
    emotion: FemaleEmotionState,
  ): ReplyType[] {
    if (style === "shy") {
      if (analysis.empathy) {
        return ["AnswerOnly", "ShortReply"];
      }
      return ["AnswerOnly", "ShortReply", "AnswerDetail"];
    }

    if (style === "bright") {
      if (analysis.empathy || analysis.naturalReaction) {
        return ["AnswerReaction", "AnswerDetail", "AnswerDetail"];
      }
      return ["AnswerDetail", "AnswerReaction"];
    }

    if (analysis.empathy) {
      return ["AnswerReaction", "AnswerDetail"];
    }

    if (emotion.interest >= 65) {
      return ["AnswerDetail", "AnswerReaction", "AnswerOnly"];
    }

    return ["AnswerDetail", "AnswerReaction", "AnswerOnly"];
  }

  private diversify(
    candidates: ReplyType[],
    recent: ReplyType[],
  ): ReplyType[] {
    if (recent.length < 2) {
      return candidates;
    }

    const lastTwo = recent.slice(-2);
    const repeated = lastTwo[0] === lastTwo[1];

    if (!repeated) {
      return candidates;
    }

    const avoid = lastTwo[0];
    const filtered = candidates.filter((type) => type !== avoid);
    return filtered.length > 0 ? filtered : candidates;
  }
}
