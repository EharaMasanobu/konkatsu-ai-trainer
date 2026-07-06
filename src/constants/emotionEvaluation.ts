import type { FemaleEmotionState } from "@/ai/emotion/FemaleEmotionState";

export interface EmotionScoreAdjustmentResult {
  scoreDelta: number;
  remeetProbabilityDelta: number;
  notes: string[];
}

/** 会話終了時の女性感情に基づく採点補正 */
export function applyEmotionScoreAdjustment(
  score: number,
  remeetProbability: number,
  emotion?: FemaleEmotionState,
): EmotionScoreAdjustmentResult {
  if (!emotion) {
    return { scoreDelta: 0, remeetProbabilityDelta: 0, notes: [] };
  }

  let scoreDelta = 0;
  let remeetProbabilityDelta = 0;
  const notes: string[] = [];

  if (emotion.comfort >= 85 && emotion.interest >= 80) {
    scoreDelta += 3;
    remeetProbabilityDelta += 8;
    notes.push("高い安心感・興味により採点を上方補正");
  } else if (emotion.comfort >= 70 && emotion.interest >= 65) {
    remeetProbabilityDelta += 4;
    notes.push("中程度の好印象により再会確率を上方補正");
  }

  if (emotion.guard >= 90) {
    scoreDelta -= 12;
    remeetProbabilityDelta -= 20;
    notes.push("警戒が非常に高く、高得点を抑制");
  } else if (emotion.guard >= 70) {
    scoreDelta -= 6;
    remeetProbabilityDelta -= 10;
    notes.push("警戒が高く、採点を下方補正");
  }

  if (emotion.fatigue >= 70) {
    scoreDelta -= 5;
    remeetProbabilityDelta -= 8;
    notes.push("疲れが蓄積し、再会意欲を下方補正");
  }

  if (emotion.interest <= 30) {
    scoreDelta -= 4;
    remeetProbabilityDelta -= 10;
    notes.push("興味が低く、再会意欲を下方補正");
  }

  const adjustedScore = Math.max(0, Math.min(100, score + scoreDelta));
  const actualScoreDelta = adjustedScore - score;

  const adjustedRemeet = Math.max(
    0,
    Math.min(100, remeetProbability + remeetProbabilityDelta),
  );

  return {
    scoreDelta: actualScoreDelta,
    remeetProbabilityDelta: adjustedRemeet - remeetProbability,
    notes,
  };
}
