import { z } from "zod";

import { EVALUATION_ITEM_MAX } from "@/constants/evaluationScoring";

const itemScoresSchema = z.object({
  senseOfSecurity: z
    .number()
    .int()
    .min(0)
    .max(EVALUATION_ITEM_MAX.senseOfSecurity),
  easeOfTalking: z
    .number()
    .int()
    .min(0)
    .max(EVALUATION_ITEM_MAX.easeOfTalking),
  naturalness: z.number().int().min(0).max(EVALUATION_ITEM_MAX.naturalness),
  questionSkill: z
    .number()
    .int()
    .min(0)
    .max(EVALUATION_ITEM_MAX.questionSkill),
  empathy: z.number().int().min(0).max(EVALUATION_ITEM_MAX.empathy),
  nonPushiness: z
    .number()
    .int()
    .min(0)
    .max(EVALUATION_ITEM_MAX.nonPushiness),
  wouldMeetAgain: z
    .number()
    .int()
    .min(0)
    .max(EVALUATION_ITEM_MAX.wouldMeetAgain),
});

const reasonEntrySchema = z.object({
  category: z.enum([
    "senseOfSecurity",
    "easeOfTalking",
    "naturalness",
    "questionSkill",
    "empathy",
    "nonPushiness",
    "wouldMeetAgain",
    "overall",
  ]),
  type: z.enum(["bonus", "deduction"]),
  points: z.number().int().min(1).max(20),
  reason: z.string().min(1),
  conversationQuote: z.string().min(1),
});

const internalReasonsSchema = z.object({
  scoringReasons: z.array(reasonEntrySchema).min(2),
  bonusReasons: z.array(reasonEntrySchema).min(1),
  deductionReasons: z.array(reasonEntrySchema).min(2),
});

const improvementSchema = z.object({
  title: z.string().min(1),
  reason: z.string().min(1),
  userQuote: z.string().min(1),
  modelAnswer: z.string().min(1),
});

export const evaluationSchema = z.object({
  itemScores: itemScoresSchema,
  internalReasons: internalReasonsSchema,
  characterAdaptationScore: z.number().int().min(0).max(100),
  characterAdaptationStars: z.number().int().min(1).max(5),
  characterAdaptationReason: z.string().min(1),
  characterMismatches: z.array(z.string().min(1)).min(1),
  howToTalkWithThisType: z.string().min(1),
  characterNextFocus: z.array(z.string().min(1)).length(3),
  characterFeedback: z.string().min(1),
  summary: z.string().min(1),
  femalePsychology: z.string().min(1),
  improvements: z.array(improvementSchema).min(3),
  nextChallenges: z.array(z.string().min(1)).length(3),
  remeetProbability: z.number().int().min(0).max(100),
});

export type EvaluationSchemaOutput = z.infer<typeof evaluationSchema>;
