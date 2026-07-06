import type { FemaleEmotionKey, FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";
import { clampEmotion } from "@/ai/emotion/FemaleEmotionState";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

export interface EmotionChangeEntry {
  field: FemaleEmotionKey;
  delta: number;
  reason: string;
}

export interface EmotionUpdateContext {
  userMessage: string;
  assistantMessage: string;
  conversationHistory: ConversationHistoryMessage[];
}

const QUESTION_PATTERN =
  /[?？]|どんな|どう|なぜ|いつ|どこ|誰|何が|何を|ますか|ですか|見ますか|好きですか/;

const EMPATHY_PATTERN =
  /そうなんですね|わかります|同感|大変|嬉しい|素敵|いいですね|すごい|共感|大変でしたね|それは/;

const NEGATION_PATTERN =
  /違う|そうじゃない|いや|嫌い|無理|ないです|ちがう|否定|おかしい/;

const LAUGHTER_PATTERN =
  /笑|www|（笑）|ハハ|面白|おもしろ|楽し|ウケる/;

const TOPIC_CHANGE_PATTERN =
  /そういえば|ところで|別の話|他には|話変わる|ところが/;

const LONG_SELF_TALK_MIN_CHARS = 80;

export class EmotionUpdateRule {
  evaluate(context: EmotionUpdateContext): EmotionChangeEntry[] {
    const changes: EmotionChangeEntry[] = [];
    const trimmed = context.userMessage.trim();

    if (trimmed.length < 3) {
      changes.push(
        { field: "fatigue", delta: 5, reason: "沈黙・極端に短い発言のため" },
        { field: "interest", delta: -5, reason: "会話が続かず興味が下がった" },
      );
      return changes;
    }

    if (QUESTION_PATTERN.test(trimmed)) {
      changes.push({
        field: "interest",
        delta: 5,
        reason: "男性が質問したため",
      });
    }

    if (EMPATHY_PATTERN.test(trimmed)) {
      changes.push(
        { field: "comfort", delta: 8, reason: "共感があったため" },
        { field: "guard", delta: -5, reason: "共感により警戒が下がった" },
        { field: "tension", delta: -3, reason: "共感で緊張が和らいだ" },
      );
    }

    if (this.isLongSelfTalk(trimmed)) {
      changes.push(
        { field: "fatigue", delta: 10, reason: "自分語りが長かったため" },
        { field: "interest", delta: -5, reason: "一方的な話で興味が下がった" },
      );
    }

    if (this.isQuestionBarrage(trimmed, context.conversationHistory)) {
      changes.push(
        { field: "guard", delta: 10, reason: "質問攻めと感じたため" },
        { field: "fatigue", delta: 5, reason: "質問攻めで疲れが増した" },
        { field: "tension", delta: 5, reason: "質問攻めで緊張が増した" },
      );
    }

    if (NEGATION_PATTERN.test(trimmed)) {
      changes.push(
        { field: "comfort", delta: -10, reason: "否定・否定的な発言のため" },
        { field: "guard", delta: 15, reason: "否定により警戒が高まった" },
      );
    }

    if (LAUGHTER_PATTERN.test(trimmed)) {
      changes.push(
        { field: "comfort", delta: 5, reason: "自然な笑い・明るい雰囲気のため" },
        { field: "interest", delta: 5, reason: "楽しい雰囲気で興味が増した" },
        { field: "tension", delta: -3, reason: "笑いで緊張が和らいだ" },
      );
    }

    if (TOPIC_CHANGE_PATTERN.test(trimmed)) {
      changes.push({
        field: "interest",
        delta: 5,
        reason: "話題転換が自然だったため",
      });
    }

    return changes;
  }

  applyChanges(
    current: FemaleEmotionState,
    changes: EmotionChangeEntry[],
  ): FemaleEmotionState {
    const next = { ...current };

    for (const change of changes) {
      next[change.field] = clampEmotion(next[change.field] + change.delta);
    }

    return next;
  }

  private isLongSelfTalk(message: string): boolean {
    const selfTalk =
      /私は|僕は|自分は|俺は|僕の|私の/.test(message) && message.length >= LONG_SELF_TALK_MIN_CHARS;
    return selfTalk || message.length >= 120;
  }

  private isQuestionBarrage(
    message: string,
    history: ConversationHistoryMessage[],
  ): boolean {
    const questionMarks = (message.match(/[?？]/g) ?? []).length;
    if (questionMarks >= 2) {
      return true;
    }

    const recentUserMessages = history
      .filter((entry) => entry.role === "user")
      .slice(-3)
      .map((entry) => entry.content);

    const recentWithCurrent = [...recentUserMessages, message];
    const questionTurns = recentWithCurrent.filter((text) =>
      QUESTION_PATTERN.test(text),
    ).length;

    return questionTurns >= 3;
  }
}
