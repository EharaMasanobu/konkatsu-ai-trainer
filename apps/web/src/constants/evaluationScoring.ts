import type { DifficultyType } from "@/constants/homeOptions";
import type { EvaluationItemScores, EvaluationVerdict } from "@konkatsu/shared-types";

/** Version3: 女性視点の評価軸（合計100点） */
export const EVALUATION_ITEM_MAX: Record<keyof EvaluationItemScores, number> = {
  senseOfSecurity: 15,
  easeOfTalking: 15,
  naturalness: 15,
  questionSkill: 15,
  empathy: 15,
  nonPushiness: 15,
  wouldMeetAgain: 10,
};

export const EVALUATION_ITEM_LABELS: Record<keyof EvaluationItemScores, string> = {
  senseOfSecurity: "安心感",
  easeOfTalking: "話しやすさ",
  naturalness: "自然さ",
  questionSkill: "質問力",
  empathy: "共感力",
  nonPushiness: "押し付け感の無さ",
  wouldMeetAgain: "また会いたいと思えたか",
};

/** 難易度による総合点補正（最小限。採点はLLM側で難易度考慮済み） */
export const DIFFICULTY_SCORE_ADJUSTMENT: Record<DifficultyType, number> = {
  Easy: 3,
  Normal: 0,
  Hard: -3,
};

export function sumItemScores(itemScores: EvaluationItemScores): number {
  return (
    itemScores.senseOfSecurity +
    itemScores.easeOfTalking +
    itemScores.naturalness +
    itemScores.questionSkill +
    itemScores.empathy +
    itemScores.nonPushiness +
    itemScores.wouldMeetAgain
  );
}

export function applyDifficultyAdjustment(
  baseScore: number,
  difficulty: DifficultyType,
): number {
  const delta = DIFFICULTY_SCORE_ADJUSTMENT[difficulty];
  return Math.max(0, Math.min(100, baseScore + delta));
}

/**
 * Version3 採点バンド（60点は平均ではない）
 * 30〜40: かなり苦戦 / 50: 普通 / 60: 少し良い
 * 70: かなり良い / 80: 婚活で十分通用 / 90+: かなり難しい
 */
export function resolveVerdict(score: number): {
  verdict: EvaluationVerdict;
  stars: number;
  bandLabel: string;
} {
  if (score >= 90) {
    return {
      verdict: "ぜひまた会いたい",
      stars: 5,
      bandLabel: "かなり難しい到達点。婚活でもトップクラスの印象",
    };
  }
  if (score >= 80) {
    return {
      verdict: "もう一度会ってみたい",
      stars: 5,
      bandLabel: "婚活で十分通用する会話力",
    };
  }
  if (score >= 70) {
    return {
      verdict: "もう一度会ってみたい",
      stars: 4,
      bandLabel: "かなり良い。次回デートの可能性が高い",
    };
  }
  if (score >= 60) {
    return {
      verdict: "まあまあ良い印象",
      stars: 3,
      bandLabel: "少し良い。決め手に欠ける部分もある",
    };
  }
  if (score >= 50) {
    return {
      verdict: "普通",
      stars: 3,
      bandLabel: "普通。特筆すべき強み・弱点は少ない",
    };
  }
  if (score >= 30) {
    return {
      verdict: "厳しい",
      stars: 2,
      bandLabel: "かなり苦戦。会話が続かない場面が多い",
    };
  }
  return {
    verdict: "お断りしたい",
    stars: 1,
    bandLabel: "会話力を根本的に改善する必要がある",
  };
}
