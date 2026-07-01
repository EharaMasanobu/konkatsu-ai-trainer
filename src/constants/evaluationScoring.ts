import type { DifficultyType } from "@/constants/homeOptions";
import type { EvaluationItemScores, EvaluationVerdict } from "@/types/Evaluation";

export const EVALUATION_ITEM_MAX: Record<keyof EvaluationItemScores, number> = {
  empathy: 20,
  question: 20,
  selfDisclosure: 15,
  depth: 15,
  naturalness: 15,
  konkatsuFit: 15,
};

export const EVALUATION_ITEM_LABELS: Record<keyof EvaluationItemScores, string> = {
  empathy: "共感力",
  question: "質問力",
  selfDisclosure: "自己開示",
  depth: "深掘り力",
  naturalness: "会話の自然さ",
  konkatsuFit: "婚活らしさ",
};

/** 難易度による総合点補正（サーバー側で適用） */
export const DIFFICULTY_SCORE_ADJUSTMENT: Record<DifficultyType, number> = {
  Easy: 15,
  Normal: 0,
  Hard: -10,
};

/** 将来拡張用 */
export const EXTREME_DIFFICULTY_SCORE_ADJUSTMENT = -20;

export function sumItemScores(itemScores: EvaluationItemScores): number {
  return (
    itemScores.empathy +
    itemScores.question +
    itemScores.selfDisclosure +
    itemScores.depth +
    itemScores.naturalness +
    itemScores.konkatsuFit
  );
}

export function applyDifficultyAdjustment(
  baseScore: number,
  difficulty: DifficultyType,
): number {
  const delta = DIFFICULTY_SCORE_ADJUSTMENT[difficulty];
  return Math.max(0, Math.min(100, baseScore + delta));
}

export function resolveVerdict(score: number): {
  verdict: EvaluationVerdict;
  stars: number;
  bandLabel: string;
} {
  if (score >= 90) {
    return {
      verdict: "ぜひまた会いたい",
      stars: 5,
      bandLabel: "ぜひもう一度会いたい",
    };
  }
  if (score >= 75) {
    return {
      verdict: "もう一度会ってみたい",
      stars: 4,
      bandLabel: "かなり好印象。次回デートの可能性が高い",
    };
  }
  if (score >= 60) {
    return {
      verdict: "迷う",
      stars: 3,
      bandLabel: "悪くはないが、決め手に欠ける",
    };
  }
  if (score >= 40) {
    return {
      verdict: "厳しい",
      stars: 2,
      bandLabel: "婚活では厳しい。改善が必要",
    };
  }
  if (score >= 20) {
    return {
      verdict: "厳しい",
      stars: 2,
      bandLabel: "次回デートはかなり難しい",
    };
  }
  return {
    verdict: "お断りしたい",
    stars: 1,
    bandLabel: "会話力を根本的に改善する必要がある",
  };
}
