import { OpenAIClient } from "@/ai/OpenAIClient";
import { PromptBuilder } from "@/ai/prompt/PromptBuilder";
import { EmotionManager } from "@/ai/emotion/EmotionManager";
import { ConversationFlowManager } from "@/ai/flow/ConversationFlowManager";
import { RomanceManager } from "@/ai/romance/RomanceManager";
import { resolveConversationDifficulty } from "@/constants/conversationDifficulty";
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
import type {
  EmotionDebugSnapshot,
  FlowDebugSnapshot,
  MemoryDebugSnapshot,
  RomanceDebugSnapshot,
  TopicDebugSnapshot,
} from "@/types/messageApi";
import type { PromptContext } from "@/types/PromptContext";

export class ConversationDirector {
  constructor(
    private readonly aiStateManager: AIStateManager,
    private readonly topicManager: TopicManager,
    private readonly memoryManager: MemoryManager,
    private readonly emotionManager: EmotionManager,
    private readonly romanceManager: RomanceManager,
    private readonly flowManager: ConversationFlowManager,
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

    if (!this.emotionManager.get(sessionId)) {
      this.emotionManager.create(sessionId);
    }

    if (!this.romanceManager.get(sessionId)) {
      this.romanceManager.create(sessionId);
    }

    this.flowManager.ensureSession(sessionId);

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

    const conversationDifficulty = resolveConversationDifficulty(
      input.session.homeForm.personalitySetting.difficulty,
    );

    const emotionLog = this.emotionManager.update(sessionId, {
      userMessage: input.userMessage,
      assistantMessage: "",
      conversationHistory: input.conversationHistory,
    });

    const romanceLog = this.romanceManager.updateFromEmotion(
      sessionId,
      emotionLog.state,
      emotionLog.changes,
    );

    const maxTurn = input.session.homeForm.conversationSetting.maxTurn;
    const currentTurn = getConversationTurn(stateForPrompt) + 1;

    const flowDecision = this.flowManager.decide(sessionId, {
      emotion: emotionLog.state,
      romanceScore: romanceLog.newScore,
      conversationHistory: input.conversationHistory,
      userMessage: input.userMessage,
      difficulty: conversationDifficulty,
      personality: input.session.homeForm.personalitySetting.personality,
      conversationStyle: input.session.homeForm.personalitySetting.conversationStyle,
      currentTurn,
      maxTurn,
    });

    const promptContext: PromptContext = {
      session: input.session,
      conversationHistory: input.conversationHistory,
      latestUserMessage: input.userMessage,
      aiState: stateForPrompt,
      topic: topicState,
      memories: relevantMemories,
      conversationDifficulty,
      femaleEmotion: emotionLog.state,
      romanceStateDescription: this.romanceManager.formatPromptGuidance(sessionId),
      flowGuidance: flowDecision.promptGuidance,
    };

    const promptResult = this.promptBuilder.build(promptContext);
    const reply = await this.openAIClient.chat(promptResult.messages);

    const willEnd =
      flowDecision.shouldEndConversation ||
      aiState.conversation.turn + 1 >= maxTurn;

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

    const shouldEnd = turn >= maxTurn || flowDecision.shouldEndConversation;

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
      result.debugEmotion = buildEmotionDebug(emotionLog);
      result.debugRomance = buildRomanceDebug(romanceLog);
      result.debugFlow = buildFlowDebug(flowDecision, currentTurn);
    }

    return result;
  }

  finishConversation(sessionId: string): FinishConversationResult {
    const aiState = this.aiStateManager.get(sessionId);
    const finalTurn = aiState ? getConversationTurn(aiState) : 0;

    this.aiStateManager.reset(sessionId);
    this.emotionManager.reset(sessionId);
    this.romanceManager.reset(sessionId);
    this.flowManager.reset(sessionId);

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

function buildEmotionDebug(
  log: import("@/ai/emotion/EmotionManager").EmotionTurnLog,
): EmotionDebugSnapshot {
  return {
    state: log.state,
    turn: log.turn,
    changes: log.changes.map((change) => ({
      field: change.field,
      delta: change.delta,
      reason: change.reason,
    })),
  };
}

function buildRomanceDebug(
  log: import("@/ai/romance/RomanceState").RomanceTurnLog,
): RomanceDebugSnapshot {
  return {
    turn: log.turn,
    previousScore: log.previousScore,
    newScore: log.newScore,
    delta: log.delta,
    reasons: log.reasons,
  };
}

function buildFlowDebug(
  decision: import("@/ai/flow/FlowState").FlowDecision,
  turn: number,
): FlowDebugSnapshot {
  return {
    turn,
    state: decision.state,
    reasons: decision.reasons,
    shouldEndConversation: decision.shouldEndConversation,
  };
}
