"use client";

import { useFormContext } from "react-hook-form";

import {
  FormField,
  SectionCard,
  selectClassName,
} from "@/components/home/FormField";
import type { HomeFormInput } from "@/schemas/home/homeFormSchema";
import {
  CONVERSATION_STYLE_OPTIONS,
  DIFFICULTY_OPTIONS,
  PERSONALITY_OPTIONS,
} from "@/constants/homeOptions";

export function PersonalitySection() {
  const { register } = useFormContext<HomeFormInput>();

  return (
    <SectionCard title="性格設定">
      <FormField label="性格" htmlFor="personalitySetting.personality">
        <select
          id="personalitySetting.personality"
          className={selectClassName}
          {...register("personalitySetting.personality")}
        >
          {PERSONALITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="会話スタイル" htmlFor="personalitySetting.conversationStyle">
        <select
          id="personalitySetting.conversationStyle"
          className={selectClassName}
          {...register("personalitySetting.conversationStyle")}
        >
          {CONVERSATION_STYLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="難易度" htmlFor="personalitySetting.difficulty">
        <select
          id="personalitySetting.difficulty"
          className={selectClassName}
          {...register("personalitySetting.difficulty")}
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FormField>
    </SectionCard>
  );
}
