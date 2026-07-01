import { OpenAIClient } from "@/ai/OpenAIClient";
import { PromptBuilder } from "@/ai/prompt/PromptBuilder";
import { getConversationTurn, getHiddenGoalEnum } from "@/ai/state/AIState";
import { AIStateManager } from "@/ai/state/AIStateManager";
import { MemoryManager } from "@/ai/memory/MemoryManager";
import { getTopicLabel } from "@/ai/topic/Topic";
import type { Topic } from "@/ai/topic/Topic";
import { TopicManager, formatCompletedTopics } from "@/ai/topic/TopicManager";
import type {
  FinishConversationResult,
  InitializeResult,
  ProcessTurnInput,
  ProcessTurnResult,
} from "@/types/conversationDirector";
import type { MemoryDebugSnapshot, TopicDebugSnapshot } from "@/types/messageApi";
import type { PromptContext } from "@/types/PromptContext";

export class ConversationDirector {
  constructor(
    private readonly aiStateManager: AIStateManager,
    private readonly topicManager: TopicManager,
    private readonly memoryManager: MemoryManager,
    private readonly promptBuilder: PromptBuilder,
    private readonly openAIClient: OpenAIClient,
  ) {}

  initialize(sessionId: string): InitializeResult {
    const aiState =
      this.aiStateManager.get(sessionId) ?? this.aiStateManager.create(sessionId);

    const topicState =
      this.topicManager.getState(sessionId) ?? this.topicManager.create(sessionId);

    if (!this.memoryManager.getStore(sessionId)) {
      this.memoryManager.create(sessionId);
    }

    return { aiState, topicState };
  }

  async processTurn(input: ProcessTurnInput): Promise<ProcessTurnResult> {
    const sessionId = input.session.sessionId;

    const { aiState } = this.initialize(sessionId);
    let topicState =
      this.topicManager.getState(sessionId) ?? this.topicManager.create(sessionId);

    const stateForPrompt = this.aiStateManager.applyTopicToConversation(
      sessionId,
      topicState,
    );

    const relevantMemories = this.memoryManager.search(sessionId, {
      currentTurn: getConversationTurn(stateForPrompt),
      currentTopic: topicState.current,
    });

    const promptContext: PromptContext = {
      session: input.session,
      conversationHistory: input.conversationHistory,
      latestUserMessage: input.userMessage,
      aiState: stateForPrompt,
      topic: topicState,
      memories: relevantMemories,
    };

    const promptResult = this.promptBuilder.build(promptContext);
    const reply = await this.openAIClient.chat(promptResult.messages);

    const maxTurn = input.session.homeForm.conversationSetting.maxTurn;
    const willEnd = aiState.conversation.turn + 1 >= maxTurn;

    const updatedState = this.aiStateManager.update(sessionId, {
      userMessage: input.userMessage,
      assistantMessage: reply,
      conversationHistory: input.conversationHistory,
      isConversationEnd: willEnd,
    });

    const topicResult = this.topicManager.update(sessionId, {
      aiState: updatedState,
      conversationHistory: input.conversationHistory,
      hiddenGoal: getHiddenGoalEnum(updatedState),
    });

    topicState = topicResult.state;
    const finalState = this.aiStateManager.applyTopicToConversation(
      sessionId,
      topicState,
    );

    const turn = getConversationTurn(finalState);

    this.memoryManager.update(sessionId, {
      userMessage: input.userMessage,
      assistantMessage: reply,
      conversationHistory: input.conversationHistory,
      currentTurn: turn,
    });

    const shouldEnd = turn >= maxTurn;

    const result: ProcessTurnResult = {
      reply,
      shouldEnd,
      turn,
    };

    if (process.env.NODE_ENV === "development") {
      result.debugState = finalState;
      result.debugTopic = buildTopicDebug(topicState, topicResult.nextCandidate);
      result.debugMemory = buildMemoryDebug(
        this.memoryManager.getAll(sessionId),
      );
      result.debugPromptPreview = promptResult.preview;
    }

    return result;
  }

  finishConversation(sessionId: string): FinishConversationResult {
    const aiState = this.aiStateManager.get(sessionId);
    const finalTurn = aiState ? getConversationTurn(aiState) : 0;

    this.aiStateManager.reset(sessionId);

    return { sessionId, finalTurn };
  }
}

function buildTopicDebug(
  topicState: import("@/ai/topic/TopicState").TopicState,
  nextCandidate: Topic | null,
): TopicDebugSnapshot {
  return {
    currentTopic: getTopicLabel(topicState.current),
    depth: topicState.depth,
    completedTopics: formatCompletedTopics(topicState),
    nextCandidate: nextCandidate ? getTopicLabel(nextCandidate) : null,
  };
}

function buildMemoryDebug(
  store: import("@/types/Memory").MemoryStore,
): MemoryDebugSnapshot {
  const toItem = (
    memory: import("@/types/Memory").Memory,
    scope: "short" | "long",
  ) => ({
    value: memory.value,
    category: memory.category,
    importance: memory.importance,
    scope,
  });

  return {
    longTerm: store.longTerm.map((m) => toItem(m, "long")),
    shortTerm: store.shortTerm.map((m) => toItem(m, "short")),
  };
}
