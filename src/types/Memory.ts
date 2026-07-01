export enum MemoryCategory {
  PROFILE = "PROFILE",
  WORK = "WORK",
  HOBBY = "HOBBY",
  FAMILY = "FAMILY",
  PET = "PET",
  FOOD = "FOOD",
  TRAVEL = "TRAVEL",
  VALUE = "VALUE",
  LOVE = "LOVE",
  OTHER = "OTHER",
}

export type MemoryScope = "short" | "long";

export interface Memory {
  id: string;
  category: MemoryCategory;
  importance: number;
  value: string;
  createdTurn: number;
  lastReferencedTurn: number;
}

export interface MemoryStore {
  shortTerm: Memory[];
  longTerm: Memory[];
}

export const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  [MemoryCategory.PROFILE]: "プロフィール",
  [MemoryCategory.WORK]: "仕事",
  [MemoryCategory.HOBBY]: "趣味",
  [MemoryCategory.FAMILY]: "家族",
  [MemoryCategory.PET]: "ペット",
  [MemoryCategory.FOOD]: "食べ物",
  [MemoryCategory.TRAVEL]: "旅行",
  [MemoryCategory.VALUE]: "価値観",
  [MemoryCategory.LOVE]: "恋愛",
  [MemoryCategory.OTHER]: "その他",
};

export function getMemoryCategoryLabel(category: MemoryCategory): string {
  return MEMORY_CATEGORY_LABELS[category];
}

export function createEmptyMemoryStore(): MemoryStore {
  return { shortTerm: [], longTerm: [] };
}
