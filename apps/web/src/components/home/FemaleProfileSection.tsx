"use client";

import { useFormContext } from "react-hook-form";

import {
  FormField,
  inputClassName,
  SectionCard,
  textareaClassName,
} from "@/components/home/FormField";
import type { HomeFormInput } from "@/schemas/home/homeFormSchema";
import { generateRandomFemaleProfile } from "@/utils/generateRandomFemaleProfile";
import { formatHobbies } from "@/utils/parseHobbies";

export function FemaleProfileSection() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<HomeFormInput>();

  const handleRandomGenerate = () => {
    const profile = generateRandomFemaleProfile();
    setValue("femaleProfile.age", profile.age);
    setValue("femaleProfile.job", profile.job);
    setValue("femaleProfile.location", profile.location);
    setValue("femaleProfile.hobbies", formatHobbies(profile.hobbies));
    setValue("femaleProfile.otherInfo", profile.otherInfo);
  };

  return (
    <SectionCard title="AI女性プロフィール">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRandomGenerate}
          className="touch-target rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 active:bg-zinc-100"
        >
          ランダム生成
        </button>
      </div>

      <FormField
        label="年齢"
        htmlFor="femaleProfile.age"
        error={errors.femaleProfile?.age}
      >
        <input
          id="femaleProfile.age"
          type="number"
          min={1}
          className={inputClassName}
          {...register("femaleProfile.age")}
        />
      </FormField>

      <FormField label="趣味" htmlFor="femaleProfile.hobbies">
        <textarea
          id="femaleProfile.hobbies"
          rows={3}
          placeholder="読書、旅行（改行またはカンマ区切り）"
          className={textareaClassName}
          {...register("femaleProfile.hobbies")}
        />
      </FormField>

      <FormField label="仕事" htmlFor="femaleProfile.job">
        <input
          id="femaleProfile.job"
          type="text"
          className={inputClassName}
          {...register("femaleProfile.job")}
        />
      </FormField>

      <FormField label="居住地" htmlFor="femaleProfile.location">
        <input
          id="femaleProfile.location"
          type="text"
          className={inputClassName}
          {...register("femaleProfile.location")}
        />
      </FormField>

      <FormField label="その他" htmlFor="femaleProfile.otherInfo">
        <textarea
          id="femaleProfile.otherInfo"
          rows={4}
          className={textareaClassName}
          {...register("femaleProfile.otherInfo")}
        />
      </FormField>
    </SectionCard>
  );
}
