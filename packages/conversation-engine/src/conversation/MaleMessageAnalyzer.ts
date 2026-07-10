import type { Topic } from "@engine/topic/Topic";
import { getTopicLabel } from "@engine/topic/Topic";
import type { ConversationHistoryMessage } from "@konkatsu/shared-types";

export interface MaleMessageAnalysis {
  askedQuestion: boolean;
  openQuestion: boolean;
  empathy: boolean;
  selfTalk: boolean;
  topicChange: boolean;
  negation: boolean;
  backchannelOnly: boolean;
  topicDepth: boolean;
  naturalReaction: boolean;
}

export type QualityGrade = "◎" | "〇" | "△" | "×";

export interface ConversationQualitySnapshot {
  question: QualityGrade;
  empathy: QualityGrade;
  topicDepth: QualityGrade;
  reaction: QualityGrade;
}

const QUESTION_PATTERN =
  /[?？]|どんな|どう|なぜ|いつ|どこ|誰|何が|何を|ますか|ですか|見ますか|好きですか/;

const OPEN_QUESTION_PATTERN =
  /どんな|どう|なぜ|いつ|どこ|教えて|聞かせて|ありますか|いかがですか/;

const EMPATHY_PATTERN =
  /そうなんですね|わかります|同感|大変|嬉しい|素敵|いいですね|すごい|共感|大変でしたね|それは|楽しそう|素敵ですね/;

const NEGATION_PATTERN =
  /違う|そうじゃない|いや|嫌い|無理|ないです|ちがう|否定|おかしい|微妙/;

const TOPIC_CHANGE_PATTERN =
  /そういえば|ところで|別の話|他には|話変わる|ところが/;

const REACTION_PATTERN =
  /そうなんですね|へー|ほー|ふーん|いいですね|すごい|面白い|なるほど|確かに/;

const BACKCHANNEL_PATTERN =
  /^(はい|ええ|うん|そうですね|そうなんですね|ふーん|へー|ほー|なるほど)[。.！]?$/;

const DEPTH_PATTERN =
  /具体的|詳しく|きっかけ|どんな|なぜ|いつから|よく|一番|特に|印象|思い出/;

const SELF_TALK_PATTERN = /私は|僕は|自分は|俺は|僕の|私の/;

export class MaleMessageAnalyzer {
  analyze(
    userMessage: string,
    conversationHistory: ConversationHistoryMessage[],
    currentTopic?: Topic,
  ): MaleMessageAnalysis {
    const trimmed = userMessage.trim();

    const askedQuestion = QUESTION_PATTERN.test(trimmed);
    const openQuestion = OPEN_QUESTION_PATTERN.test(trimmed);
    const empathy = EMPATHY_PATTERN.test(trimmed);
    const selfTalk =
      SELF_TALK_PATTERN.test(trimmed) && trimmed.length >= 50;
    const topicChange = TOPIC_CHANGE_PATTERN.test(trimmed);
    const negation = NEGATION_PATTERN.test(trimmed);
    const backchannelOnly =
      trimmed.length <= 12 && BACKCHANNEL_PATTERN.test(trimmed);
    const naturalReaction = REACTION_PATTERN.test(trimmed) && !askedQuestion;
    const topicDepth =
      DEPTH_PATTERN.test(trimmed) ||
      (askedQuestion && trimmed.length >= 20) ||
      this.referencesCurrentTopic(trimmed, currentTopic);

    return {
      askedQuestion,
      openQuestion,
      empathy,
      selfTalk,
      topicChange,
      negation,
      backchannelOnly,
      topicDepth,
      naturalReaction,
    };
  }

  toConversationQuality(analysis: MaleMessageAnalysis): ConversationQualitySnapshot {
    return {
      question: this.gradeQuestion(analysis),
      empathy: this.gradeEmpathy(analysis),
      topicDepth: this.gradeTopicDepth(analysis),
      reaction: this.gradeReaction(analysis),
    };
  }

  private gradeQuestion(analysis: MaleMessageAnalysis): QualityGrade {
    if (analysis.openQuestion) {
      return "◎";
    }
    if (analysis.askedQuestion) {
      return "〇";
    }
    if (analysis.backchannelOnly) {
      return "×";
    }
    return "△";
  }

  private gradeEmpathy(analysis: MaleMessageAnalysis): QualityGrade {
    if (analysis.negation) {
      return "×";
    }
    if (analysis.empathy) {
      return "◎";
    }
    if (analysis.naturalReaction) {
      return "〇";
    }
    return "△";
  }

  private gradeTopicDepth(analysis: MaleMessageAnalysis): QualityGrade {
    if (analysis.topicChange && !analysis.topicDepth) {
      return "△";
    }
    if (analysis.topicDepth && analysis.openQuestion) {
      return "◎";
    }
    if (analysis.topicDepth) {
      return "〇";
    }
    if (analysis.selfTalk) {
      return "△";
    }
    return "△";
  }

  private gradeReaction(analysis: MaleMessageAnalysis): QualityGrade {
    if (analysis.backchannelOnly) {
      return "×";
    }
    if (analysis.empathy || analysis.naturalReaction) {
      return "〇";
    }
    if (analysis.askedQuestion) {
      return "〇";
    }
    return "△";
  }

  private referencesCurrentTopic(
    message: string,
    currentTopic?: Topic,
  ): boolean {
    if (!currentTopic) {
      return false;
    }
    const label = getTopicLabel(currentTopic);
    return message.includes(label);
  }
}
