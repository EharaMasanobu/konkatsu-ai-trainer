import {
  FEMALE_AGE_POOL,
  FEMALE_HOBBY_POOL,
  FEMALE_JOB_POOL,
  FEMALE_LOCATION_POOL,
  FEMALE_OTHER_INFO_POOL,
} from "@/constants/femaleProfilePool";
import type { FemaleProfile } from "@konkatsu/shared-types";

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickUnique<T>(items: readonly T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

function pickHobbyCount(): number {
  return 2 + Math.floor(Math.random() * 3);
}

/**
 * プールから組み合わせてランダムな女性プロフィールを生成する。
 * 固定テンプレートではなく要素の組み合わせでバリエーションを確保する。
 */
export function generateRandomFemaleProfile(): FemaleProfile {
  return {
    age: pickOne(FEMALE_AGE_POOL),
    job: pickOne(FEMALE_JOB_POOL),
    location: pickOne(FEMALE_LOCATION_POOL),
    hobbies: pickUnique(FEMALE_HOBBY_POOL, pickHobbyCount()),
    otherInfo: pickOne(FEMALE_OTHER_INFO_POOL),
  };
}
