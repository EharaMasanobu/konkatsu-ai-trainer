import { z } from "zod";

import { EVALUATION_ITEM_MAX } from "@/constants/evaluationScoring";

const itemScoresSchema = z.object({
  empathy: z.number().int().min(0).max(EVALUATION_ITEM_MAX.empathy),
  question: z.number().int().min(0).max(EVALUATION_ITEM_MAX.question),
  selfDisclosure: z
    .number()
    .int()
    .min(0)
    .max(EVALUATION_ITEM_MAX.selfDisclosure),
  depth: z.number().int().min(0).max(EVALUATION_ITEM_MAX.depth),
  naturalness: z.number().int().min(0).max(EVALUATION_ITEM_MAX.naturalness),
  konkatsuFit: z.number().int().min(0).max(EVALUATION_ITEM_MAX.konkatsuFit),
});

const improvementSchema = z.object({
  title: z.string().min(1),
  reason: z.string().min(1),
  userQuote: z.string().min(1),
  modelAnswer: z.string().min(1),
});

export const evaluationSchema = z.object({
  itemScores: itemScoresSchema,
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
