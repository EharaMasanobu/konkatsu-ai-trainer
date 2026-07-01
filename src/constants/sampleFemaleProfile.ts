import type { FemaleProfile } from "@/types/femaleProfile";
import { generateRandomFemaleProfile } from "@/utils/generateRandomFemaleProfile";

export const SAMPLE_FEMALE_PROFILE: FemaleProfile = {
  age: 32,
  job: "看護師",
  location: "大阪府",
  hobbies: ["ヨガ", "カフェ巡り", "映画鑑賞"],
  otherInfo: "休日はのんびり過ごすのが好きです。",
};

export { generateRandomFemaleProfile };