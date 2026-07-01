import { MemoryExtractor, type MemoryExtractorInput } from "@/ai/memory/MemoryExtractor";
import { MemoryRule } from "@/ai/memory/MemoryRule";
import type { MemoryExtractionCandidate } from "@/ai/memory/MemoryRule";
import { Topic } from "@/ai/topic/Topic";
import {
  createEmptyMemoryStore,
  type Memory,
  type MemoryStore,
} from "@/types/Memory";

const MAX_PROMPT_MEMORIES = 8;

export interface MemorySearchContext {
  currentTurn: number;
  currentTopic?: Topic;
}

export type MemoryUpdateInput = MemoryExtractorInput;

export interface MemoryUpdateResult {
  store: MemoryStore;
  added: Memory[];
}

let memoryIdCounter = 0;

function createMemoryId(): string {
  memoryIdCounter += 1;
  return `mem_${Date.now()}_${memoryIdCounter}`;
}

function cloneStore(store: MemoryStore): MemoryStore {
  return structuredClone(store);
}

export class MemoryManager {
  private readonly stores = new Map<string, MemoryStore>();

  constructor(
    private readonly memoryRule: MemoryRule = new MemoryRule(),
    private readonly memoryExtractor: MemoryExtractor = new MemoryExtractor(),
  ) {}

  create(sessionId: string): MemoryStore {
    const store = createEmptyMemoryStore();
    this.stores.set(sessionId, store);
    return cloneStore(store);
  }

  getStore(sessionId: string): MemoryStore | undefined {
    const store = this.stores.get(sessionId);
    return store ? cloneStore(store) : undefined;
  }

  add(
    sessionId: string,
    candidate: MemoryExtractionCandidate,
    currentTurn: number,
  ): Memory | null {
    const store = this.stores.get(sessionId);
    if (!store) {
      throw new Error(`MemoryStore not found for session: ${sessionId}`);
    }

    const allExisting = [...store.longTerm, ...store.shortTerm];
    if (!this.memoryRule.shouldAdd(candidate, allExisting)) {
      return null;
    }

    const memory: Memory = {
      id: createMemoryId(),
      category: candidate.category,
      importance: candidate.importance,
      value: candidate.value,
      createdTurn: currentTurn,
      lastReferencedTurn: currentTurn,
    };

    if (candidate.scope === "short") {
      store.shortTerm.push(memory);
    } else {
      store.longTerm.push(memory);
    }

    this.stores.set(sessionId, store);
    return { ...memory };
  }

  updateMemory(
    sessionId: string,
    id: string,
    patch: Partial<Pick<Memory, "importance" | "value" | "lastReferencedTurn">>,
  ): Memory | null {
    const store = this.stores.get(sessionId);
    if (!store) {
      return null;
    }

    const updated = this.patchInList(store.shortTerm, id, patch)
      ?? this.patchInList(store.longTerm, id, patch);

    if (!updated) {
      return null;
    }

    this.stores.set(sessionId, store);
    return { ...updated };
  }

  remove(sessionId: string, id: string): boolean {
    const store = this.stores.get(sessionId);
    if (!store) {
      return false;
    }

    const shortBefore = store.shortTerm.length;
    const longBefore = store.longTerm.length;

    store.shortTerm = store.shortTerm.filter((m) => m.id !== id);
    store.longTerm = store.longTerm.filter((m) => m.id !== id);

    const removed =
      store.shortTerm.length < shortBefore || store.longTerm.length < longBefore;

    if (removed) {
      this.stores.set(sessionId, store);
    }

    return removed;
  }

  search(sessionId: string, context: MemorySearchContext): Memory[] {
    const store = this.stores.get(sessionId);
    if (!store) {
      return [];
    }

    const all = [...store.longTerm, ...store.shortTerm];
    const topicKey = context.currentTopic;

    const scored = all
      .map((memory) => ({
        memory,
        score: this.memoryRule.scoreRelevance(memory, {
          currentTurn: context.currentTurn,
          currentTopic: topicKey,
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_PROMPT_MEMORIES);

    for (const { memory } of scored) {
      memory.lastReferencedTurn = context.currentTurn;
    }

    this.stores.set(sessionId, store);
    return scored.map((s) => ({ ...s.memory }));
  }

  getAll(sessionId: string): MemoryStore {
    const store = this.stores.get(sessionId);
    if (!store) {
      return createEmptyMemoryStore();
    }
    return cloneStore(store);
  }

  clear(sessionId: string): void {
    this.stores.delete(sessionId);
  }

  /** AI返答後: 抽出 → 追加 */
  update(sessionId: string, input: MemoryUpdateInput): MemoryUpdateResult {
    const store =
      this.stores.get(sessionId) ?? this.createInternal(sessionId);

    const candidates = this.memoryExtractor.extract(input);
    const added: Memory[] = [];

    for (const candidate of candidates) {
      const memory = this.add(sessionId, candidate, input.currentTurn);
      if (memory) {
        added.push(memory);
      }
    }

    return {
      store: cloneStore(this.stores.get(sessionId) ?? store),
      added,
    };
  }

  formatRelevantMemories(sessionId: string, context: MemorySearchContext): string {
    const relevant = this.search(sessionId, context);
    return this.memoryRule.formatForPrompt(relevant);
  }

  private createInternal(sessionId: string): MemoryStore {
    const store = createEmptyMemoryStore();
    this.stores.set(sessionId, store);
    return store;
  }

  private patchInList(
    list: Memory[],
    id: string,
    patch: Partial<Pick<Memory, "importance" | "value" | "lastReferencedTurn">>,
  ): Memory | null {
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) {
      return null;
    }

    list[index] = { ...list[index], ...patch };
    return list[index];
  }
}
