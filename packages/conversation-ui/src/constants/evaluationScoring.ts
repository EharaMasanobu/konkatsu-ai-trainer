import type { EvaluationItemScores } from "@konkatsu/shared-types";

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
