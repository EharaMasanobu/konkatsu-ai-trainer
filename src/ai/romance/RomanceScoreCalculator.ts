import type { EmotionChangeEntry } from "@/ai/emotion/EmotionUpdateRule";
import type { FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";
import { clampEmotion } from "@/ai/emotion/FemaleEmotionState";

export interface RomanceScoreUpdate {
  delta: number;
  reasons: string[];
}

/** EmotionManager の状態・変化から恋愛度の増減を算出 */
export class RomanceScoreCalculator {
  computeUpdate(
    emotion: FemaleEmotionState,
    emotionChanges: EmotionChangeEntry[],
  ): RomanceScoreUpdate {
    const reasons: string[] = [];
    let delta = 0;

    for (const change of emotionChanges) {
      const mapped = this.mapEmotionChangeToRomance(change);
      delta += mapped.delta;
      if (mapped.reason) {
        reasons.push(mapped.reason);
      }
    }

    const pullDelta = this.computeEmotionPull(emotion, reasons);
    delta += pullDelta;

    return {
      delta: Math.round(delta),
      reasons,
    };
  }

  /** 現在の感情バランスから緩やかに恋愛度へ引き寄せ */
  private computeEmotionPull(
    emotion: FemaleEmotionState,
    reasons: string[],
  ): number {
    const target =
      emotion.comfort * 0.35 +
      emotion.interest * 0.35 +
      (100 - emotion.guard) * 0.15 +
      (100 - emotion.fatigue) * 0.1 +
      (100 - emotion.tension) * 0.05;

    const pull = (target - 50) * 0.04;

    if (pull >= 2 && !reasons.some((r) => r.includes("安心"))) {
      reasons.push("全体的に安心して話せる雰囲気");
    }
    if (pull <= -2 && !reasons.some((r) => r.includes("警戒"))) {
      reasons.push("警戒心や疲れが恋愛印象を下げている");
    }

    return pull;
  }

  private mapEmotionChangeToRomance(change: EmotionChangeEntry): {
    delta: number;
    reason: string | null;
  } {
    const { field, delta: emotionDelta, reason } = change;

    if (emotionDelta === 0) {
      return { delta: 0, reason: null };
    }

    if (field === "comfort" && emotionDelta > 0) {
      return { delta: emotionDelta * 0.5, reason: "安心感が高まった" };
    }
    if (field === "interest" && emotionDelta > 0) {
      return { delta: emotionDelta * 0.6, reason: "興味が湧いた" };
    }
    if (field === "guard" && emotionDelta > 0) {
      return { delta: emotionDelta * -0.55, reason: "警戒が高まった" };
    }
    if (field === "guard" && emotionDelta < 0) {
      return { delta: Math.abs(emotionDelta) * 0.4, reason: "心の距離が縮まった" };
    }
    if (field === "fatigue" && emotionDelta > 0) {
      return { delta: emotionDelta * -0.45, reason: "会話の疲れが増した" };
    }
    if (field === "tension" && emotionDelta > 0) {
      return { delta: emotionDelta * -0.3, reason: "緊張が高まった" };
    }
    if (field === "tension" && emotionDelta < 0) {
      return { delta: Math.abs(emotionDelta) * 0.25, reason: "リラックスできた" };
    }

    if (reason.includes("共感")) {
      return { delta: 4, reason: "共感があった" };
    }
    if (reason.includes("質問攻め")) {
      return { delta: -5, reason: "質問が多すぎた" };
    }
    if (reason.includes("否定")) {
      return { delta: -6, reason: "否定的な印象" };
    }
    if (reason.includes("笑い") || reason.includes("明るい")) {
      return { delta: 3, reason: "自然なリアクション" };
    }
    if (reason.includes("話題転換")) {
      return { delta: 3, reason: "話題の広げ方が自然" };
    }
    if (reason.includes("沈黙")) {
      return { delta: -4, reason: "会話が続かなかった" };
    }
    if (reason.includes("自分語り")) {
      return { delta: -4, reason: "一方的な話が続いた" };
    }
    if (reason.includes("質問した")) {
      return { delta: 2, reason: "関心を示す質問ができた" };
    }

    return { delta: 0, reason: null };
  }

  clampScore(score: number): number {
    return clampEmotion(score);
  }
}
