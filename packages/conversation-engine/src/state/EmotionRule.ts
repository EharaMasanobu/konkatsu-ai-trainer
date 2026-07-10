import type { EmotionState } from "@engine/state/AIState";

export interface EmotionRuleContext {
  userMessage: string;
  assistantMessage: string;
}

export type EmotionDelta = Partial<EmotionState>;

const EMPATHY_PATTERN =
  /そうなんですね|わかります|同感|大変|嬉しい|素敵|いいですね|すごい|共感/;

const SELF_DISCLOSURE_PATTERN =
  /私は|僕は|自分は|趣味|仕事|休日|家族|好き|嫌い|大切|思って|感じて/;

const SURPRISE_PATTERN =
  /えっ|まさか|びっくり|意外|すごい|本当|へえ|ほんと/;

const POSITIVE_PATTERN =
  /楽しい|嬉しい|好き|面白い|いいね|よかった|幸せ|ワクワク/;

const NERVOUS_DECAY_PER_TURN = 2;

export class EmotionRule {
  evaluate(context: EmotionRuleContext): EmotionDelta {
    const delta: EmotionDelta = {};
    const { userMessage } = context;
    const trimmed = userMessage.trim();

    delta.nervous = -NERVOUS_DECAY_PER_TURN;

    if (!trimmed) {
      return delta;
    }

    if (SELF_DISCLOSURE_PATTERN.test(trimmed)) {
      delta.curious = 5;
      delta.happy = 2;
    }

    if (SURPRISE_PATTERN.test(trimmed)) {
      delta.surprised = 8;
      delta.curious = 3;
    }

    if (POSITIVE_PATTERN.test(trimmed)) {
      delta.happy = 5;
    }

    if (EMPATHY_PATTERN.test(trimmed)) {
      delta.happy = 3;
    }

    return delta;
  }
}
