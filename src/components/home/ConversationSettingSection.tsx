"use client";

import { useFormContext } from "react-hook-form";

import {
  FormField,
  inputClassName,
  SectionCard,
} from "@/components/home/FormField";
import type { HomeFormInput } from "@/schemas/home/homeFormSchema";

export function ConversationSettingSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<HomeFormInput>();

  return (
    <SectionCard title="会話設定">
      <FormField
        label="最低会話ターン数"
        htmlFor="conversationSetting.minTurn"
        required
        error={errors.conversationSetting?.minTurn}
      >
        <input
          id="conversationSetting.minTurn"
          type="number"
          min={1}
          className={inputClassName}
          {...register("conversationSetting.minTurn")}
        />
      </FormField>

      <FormField
        label="最大会話ターン数"
        htmlFor="conversationSetting.maxTurn"
        required
        error={errors.conversationSetting?.maxTurn}
      >
        <input
          id="conversationSetting.maxTurn"
          type="number"
          min={1}
          className={inputClassName}
          {...register("conversationSetting.maxTurn")}
        />
      </FormField>
    </SectionCard>
  );
}
