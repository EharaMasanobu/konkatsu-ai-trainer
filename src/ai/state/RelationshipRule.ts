import type { RelationshipState } from "@/ai/state/AIState";

export interface RelationshipRuleContext {
  userMessage: string;
  assistantMessage: string;
  isConversationEnd: boolean;
}

export type RelationshipDelta = Partial<RelationshipState>;

const QUESTION_PATTERN =
  /[?？]|ですか|ますか|でしょうか|どんな|どう|何を|何が|いつ|どこ|なぜ|なんで|教えて/;

const EMPATHY_PATTERN =
  /そうなんですね|わかります|同感|大変|嬉しい|素敵|いいですね|すごい|共感|励ま|応援|頑張って|お疲れ|よかった|素晴らしい/;

const COMPLIMENT_PATTERN =
  /素敵|かわいい|可愛い|美人|綺麗|きれい|素晴らしい|ステキ|いいね|いい感じ/;

const SHORT_REPLY_MAX_LENGTH = 12;

export class RelationshipRule {
  evaluate(context: RelationshipRuleContext): RelationshipDelta {
    const delta: RelationshipDelta = {};
    const { userMessage, isConversationEnd } = context;
    const trimmed = userMessage.trim();

    if (!trimmed) {
      return delta;
    }

    if (QUESTION_PATTERN.test(trimmed)) {
      delta.interest = 5;
      delta.trust = 2;
    } else if (trimmed.length <= SHORT_REPLY_MAX_LENGTH) {
      delta.interest = -5;
    } else {
      delta.interest = 1;
    }

    if (EMPATHY_PATTERN.test(trimmed)) {
      delta.trust = 10;
      delta.comfort = 5;
    }

    if (COMPLIMENT_PATTERN.test(trimmed)) {
      delta.romance = 3;
      delta.comfort = 3;
    }

    if (isConversationEnd) {
      delta.romance = (delta.romance ?? 0) + 2;
      delta.trust = (delta.trust ?? 0) + 1;
    }

    return delta;
  }
}
