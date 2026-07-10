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
  [MemoryCategory.PROFILE]: "??????",
  [MemoryCategory.WORK]: "??",
  [MemoryCategory.HOBBY]: "??",
  [MemoryCategory.FAMILY]: "??",
  [MemoryCategory.PET]: "???",
  [MemoryCategory.FOOD]: "???",
  [MemoryCategory.TRAVEL]: "??",
  [MemoryCategory.VALUE]: "???",
  [MemoryCategory.LOVE]: "??",
  [MemoryCategory.OTHER]: "???",
};

export function getMemoryCategoryLabel(category: MemoryCategory): string {
  return MEMORY_CATEGORY_LABELS[category];
}

export function createEmptyMemoryStore(): MemoryStore {
  return { shortTerm: [], longTerm: [] };
}
