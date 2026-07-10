"use client";

import { useFormContext } from "react-hook-form";

import {
  FormField,
  inputClassName,
  SectionCard,
  textareaClassName,
} from "@/components/home/FormField";
import type { HomeFormInput } from "@/schemas/home/homeFormSchema";

export function UserProfileSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<HomeFormInput>();

  return (
    <SectionCard title="あなたのプロフィール">
      <FormField
        label="年齢"
        htmlFor="userProfile.age"
        required
        error={errors.userProfile?.age}
      >
        <input
          id="userProfile.age"
          type="number"
          min={1}
          className={inputClassName}
          {...register("userProfile.age")}
        />
      </FormField>

      <FormField label="趣味" htmlFor="userProfile.hobbies">
        <textarea
          id="userProfile.hobbies"
          rows={3}
          placeholder="読書、旅行（改行またはカンマ区切り）"
          className={textareaClassName}
          {...register("userProfile.hobbies")}
        />
      </FormField>

      <FormField label="仕事" htmlFor="userProfile.job">
        <input
          id="userProfile.job"
          type="text"
          className={inputClassName}
          {...register("userProfile.job")}
        />
      </FormField>

      <FormField label="居住地" htmlFor="userProfile.location">
        <input
          id="userProfile.location"
          type="text"
          className={inputClassName}
          {...register("userProfile.location")}
        />
      </FormField>

      <FormField label="その他" htmlFor="userProfile.otherInfo">
        <textarea
          id="userProfile.otherInfo"
          rows={4}
          className={textareaClassName}
          {...register("userProfile.otherInfo")}
        />
      </FormField>
    </SectionCard>
  );
}
