import { z } from "zod";

import {
  CONVERSATION_STYLE_OPTIONS,
  DIFFICULTY_OPTIONS,
  PERSONALITY_OPTIONS,
} from "@/constants/homeOptions";

const optionalAgeSchema = z.preprocess(
  (value) => {
    if (value === "" || value === undefined) {
      return undefined;
    }
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      return undefined;
    }
    return numberValue;
  },
  z.number().min(1, "年齢は1以上で入力してください").optional(),
);

const profileSchema = z.object({
  job: z.string(),
  location: z.string(),
  hobbies: z.string(),
  otherInfo: z.string(),
});

export const homeFormSchema = z
  .object({
    userProfile: profileSchema.extend({
      age: z.coerce
        .number({ message: "年齢を入力してください" })
        .min(1, "年齢は1以上で入力してください"),
    }),
    femaleProfile: profileSchema.extend({
      age: optionalAgeSchema,
    }),
    personalitySetting: z.object({
      personality: z.enum(PERSONALITY_OPTIONS),
      conversationStyle: z.enum(CONVERSATION_STYLE_OPTIONS),
      difficulty: z.enum(DIFFICULTY_OPTIONS),
    }),
    conversationSetting: z.object({
      minTurn: z.coerce
        .number({ message: "最低会話ターン数を入力してください" })
        .min(1, "最低会話ターン数は1以上で入力してください"),
      maxTurn: z.coerce
        .number({ message: "最大会話ターン数を入力してください" })
        .min(1, "最大会話ターン数は1以上で入力してください"),
    }),
  })
  .refine(
    (data) => data.conversationSetting.minTurn <= data.conversationSetting.maxTurn,
    {
      message: "最低会話ターン数は最大会話ターン数以下にしてください",
      path: ["conversationSetting", "minTurn"],
    },
  );

export type HomeFormValues = z.infer<typeof homeFormSchema>;
export type HomeFormInput = z.input<typeof homeFormSchema>;
