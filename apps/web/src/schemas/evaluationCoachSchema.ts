import { z } from "zod";

const scoreSchema = z.number().int().min(0).max(100);
const ratingSchema = z.number().int().min(0).max(100);

export const evaluationCoachSchema = z.object({
  totalScore: scoreSchema,
  summary: z.string().min(1),
  strengths: z
    .array(
      z.object({
        title: z.string().min(1),
        reason: z.string().min(1),
      }),
    )
    .min(3),
  weakPoints: z
    .array(
      z.object({
        title: z.string().min(1),
        reason: z.string().min(1),
        userQuote: z.string().min(1),
        modelAnswer: z.string().min(1),
      }),
    )
    .min(3),
  timeline: z
    .array(
      z.object({
        turn: z.number().int().min(1),
        user: z.string().min(1),
        assistant: z.string().min(1),
        evaluation: z.string().min(1),
        femaleFeeling: z.string().min(1),
      }),
    )
    .min(1),
  femalePsychology: z.object({
    interest: ratingSchema,
    comfort: ratingSchema,
    trust: ratingSchema,
    romance: ratingSchema,
    nextDate: ratingSchema,
  }),
  nextMission: z.array(z.string().min(1)).length(3),
});

export type EvaluationCoachSchemaOutput = z.infer<typeof evaluationCoachSchema>;
