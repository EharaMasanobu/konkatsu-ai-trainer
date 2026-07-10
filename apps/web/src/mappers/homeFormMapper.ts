import type { HomeFormValues } from "@/schemas/home/homeFormSchema";
import type { HomeForm } from "@konkatsu/shared-types";
import { parseHobbies } from "@/utils/parseHobbies";

export function toHomeForm(values: HomeFormValues): HomeForm {
  return {
    userProfile: {
      age: values.userProfile.age,
      job: values.userProfile.job,
      location: values.userProfile.location,
      hobbies: parseHobbies(values.userProfile.hobbies),
      otherInfo: values.userProfile.otherInfo,
    },
    femaleProfile: {
      age: values.femaleProfile.age ?? 0,
      job: values.femaleProfile.job,
      location: values.femaleProfile.location,
      hobbies: parseHobbies(values.femaleProfile.hobbies),
      otherInfo: values.femaleProfile.otherInfo,
    },
    personalitySetting: values.personalitySetting,
    conversationSetting: values.conversationSetting,
  };
}
