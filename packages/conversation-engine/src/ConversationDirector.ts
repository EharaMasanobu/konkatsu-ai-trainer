import type { ConversationConfig } from "@konkatsu/shared-types";
import type { LLMChatMessage, LLMProvider } from "@engine/providers/LLMProvider";
import { PromptBuilder } from "@engine/prompt/PromptBuilder";
import { MaleMessageAnalyzer } from "@engine/conversation/MaleMessageAnalyzer";
import type { ConversationQualitySnapshot } from "@engine/conversation/MaleMessageAnalyzer";
import { ReplyQualityChecker } from "@engine/conversation/ReplyQualityChecker";
import type { ReplyQualityCheckContext } from "@engine/conversation/ReplyQualityChecker";
import type { ReplyType } from "@engine/conversation/ReplyType";
import { ReplyTypeResolver } from "@engine/conversation/ReplyTypeResolver";
import { formatReplyTypeGuidance } from "@engine/conversation/ReplyTypePromptFormatter";
import { EmotionManager } from "@engine/emotion/EmotionManager";
import { ConversationFlowManager } from "@engine/flow/ConversationFlowManager";
import { formatFlowStateForPrompt } from "@engine/flow/FlowPromptFormatter";
import type { FlowDecision } from "@engine/flow/FlowState";
import { RomanceManager } from "@engine/romance/RomanceManager";
import { resolveConversationDifficulty } from "@engine/constants/conversationDifficulty";
import { getCharacterReplyStyle } from "@engine/constants/characterReplyStyles";
import { DEFAULT_MIN_TURN } from "@engine/constants/homeOptions";
import { getConversationTurn, getHiddenGoalEnum } from "@engine/state/AIState";
import { AIStateManager } from "@engine/state/AIStateManager";
import { MemoryManager } from "@engine/memory/MemoryManager";
import { getTopicLabel } from "@engine/topic/Topic";
import type { Topic } from "@engine/topic/Topic";
import { TopicManager, formatCompletedTopics } from "@engine/topic/TopicManager";
import type {
  FinishConversationResult,
  InitializeResult,
  ProcessTurnInput,
  ProcessTurnResult,
} from "@engine/types/conversationDirector";
import type {
  EmotionDebugSnapshot,
  FlowDebugSnapshot,
  MemoryDebugSnapshot,
  RomanceDebugSnapshot,
  TopicDebugSnapshot,
  TurnSummaryDebugSnapshot,
} from "@konkatsu/shared-types";
import type { PromptContext } from "@engine/types/PromptContext";
import { logger } from "@engine/utils/logger";

export class ConversationDirector {
  private readonly replyQualityChecker = new ReplyQualityChecker();
  private readonly replyTypeResolver = new ReplyTypeResolver();
  private readonly maleMessageAnalyzer = new MaleMessageAnalyzer();

  constructor(
    private readonly aiStateManager: AIStateManager,
    private readonly topicManager: TopicManager,
    private readonly memoryManager: MemoryManager,
    private readonly emotionManager: EmotionManager,
    private readonly romanceManager: RomanceManager,
    private readonly flowManager: ConversationFlowManager,
    private readonly promptBuilder: PromptBuilder,
    private readonly llmProvider: LLMProvider,
    private readonly config: ConversationConfig,
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
    const personality = input.session.homeForm.personalitySetting.personality;
    const characterReplyStyle = getCharacterReplyStyle(personality);

    const maleAnalysis = this.maleMessageAnalyzer.analyze(
      input.userMessage,
      input.conversationHistory,
      topicState.current,
    );
    const conversationQuality =
      this.maleMessageAnalyzer.toConversationQuality(maleAnalysis);

    const emotionLog = this.emotionManager.update(sessionId, {
      userMessage: input.userMessage,
      assistantMessage: "",
      conversationHistory: input.conversationHistory,
      maleAnalysis,
    });

    const romanceLog = this.romanceManager.updateFromEmotion(
      sessionId,
      emotionLog.state,
      emotionLog.changes,
      maleAnalysis,
    );

    const maxTurn = input.session.homeForm.conversationSetting.maxTurn;
    const minTurn = Math.max(
      input.session.homeForm.conversationSetting.minTurn,
      DEFAULT_MIN_TURN,
    );
    const currentTurn = getConversationTurn(stateForPrompt) + 1;

    let flowDecision = this.flowManager.decide(sessionId, {
      emotion: emotionLog.state,
      romanceScore: romanceLog.newScore,
      conversationHistory: input.conversationHistory,
      userMessage: input.userMessage,
      difficulty: conversationDifficulty,
      personality,
      conversationStyle: input.session.homeForm.personalitySetting.conversationStyle,
      currentTurn,
      minTurn,
      maxTurn,
      maleAnalysis,
    });

    const topicShiftTarget =
      flowDecision.state === "TOPIC_SHIFT"
        ? this.topicManager.peekNextTopicForShift(sessionId, {
            aiState: stateForPrompt,
            conversationHistory: input.conversationHistory,
            hiddenGoal: getHiddenGoalEnum(stateForPrompt),
          })
        : null;
    const topicShiftTargetLabel = topicShiftTarget
      ? getTopicLabel(topicShiftTarget)
      : undefined;

    const replyType = this.replyTypeResolver.resolve({
      flowState: flowDecision.state,
      emotion: emotionLog.state,
      personality,
      difficulty: conversationDifficulty,
      recentReplyTypes: this.flowManager.getRecentReplyTypes(sessionId),
      maleAnalysis,
    });

    flowDecision = {
      ...flowDecision,
      expectedReplyType: replyType,
      topicShiftTarget,
      topicShiftTargetLabel,
      promptGuidance: formatFlowStateForPrompt(
        flowDecision.state,
        emotionLog.state,
        topicShiftTargetLabel,
      ),
    };

    const replyTypeGuidance = formatReplyTypeGuidance(
      replyType,
      flowDecision.state,
      characterReplyStyle,
      conversationDifficulty,
      topicShiftTargetLabel,
    );

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
      flowState: flowDecision.state,
      replyType,
      replyTypeGuidance,
      characterReplyStyle,
      topicShiftTarget,
      topicShiftTargetLabel,
      maleMessageAnalysis: maleAnalysis,
      conversationQuality,
    };

    const promptResult = this.promptBuilder.build(promptContext);
    const qualityContext: ReplyQualityCheckContext = {
      expectedReplyType: replyType,
      flowState: flowDecision.state,
      questionAllowed: flowDecision.questionAllowed,
      topicShiftAllowed: flowDecision.topicShiftAllowed,
      characterStyle: characterReplyStyle,
      topicShiftTargetLabel,
      currentTopicLabel: getTopicLabel(topicState.current),
      difficulty: conversationDifficulty,
      recentReplyTypes: this.flowManager.getRecentReplyTypes(sessionId),
    };

    const { reply, replyType: actualReplyType } =
      await this.generateReplyWithQualityCheck(
        promptResult.messages,
        qualityContext,
      );

    this.flowManager.recordReplyType(sessionId, actualReplyType);

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
      shiftTarget:
        flowDecision.state === "TOPIC_SHIFT" ? topicShiftTarget ?? undefined : undefined,
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
      result.debugTurnSummary = buildTurnSummaryDebug({
        turn: currentTurn,
        emotionLog,
        romanceLog,
        flowDecision,
        replyType: actualReplyType,
        topicLabel: getTopicLabel(topicState.current),
        topicShiftTargetLabel,
        conversationQuality,
      });
      logTurnSummary(result.debugTurnSummary);
    }

    return result;
  }

  private async generateReplyWithQualityCheck(
    messages: LLMChatMessage[],
    context: ReplyQualityCheckContext,
  ): Promise<{ reply: string; replyType: ReplyType }> {
    const llmOptions = {
      temperature: this.config.llm.temperature,
      maxTokens: this.config.llm.maxTokens,
      model: this.config.llm.model,
    };
    let reply = await this.llmProvider.chat(messages, llmOptions);
    let check = this.replyQualityChecker.check(reply, context);
    let attempts = 0;

    while (!check.valid && attempts < this.replyQualityChecker.maxAttempts) {
      const regenerateMessages: LLMChatMessage[] = [
        ...messages,
        { role: "assistant", content: reply },
        {
          role: "user",
          content: this.replyQualityChecker.buildRegenerateUserMessage(
            check.issues,
            context,
          ),
        },
      ];
      reply = await this.llmProvider.chat(regenerateMessages, llmOptions);
      check = this.replyQualityChecker.check(reply, context);
      attempts += 1;
    }

    return { reply, replyType: check.replyType };
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
  topicState: import("@engine/topic/TopicState").TopicState,
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
  store: import("@konkatsu/shared-types").MemoryStore,
): MemoryDebugSnapshot {
  const toItem = (
    memory: import("@konkatsu/shared-types").Memory,
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
  log: import("@engine/emotion/EmotionManager").EmotionTurnLog,
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
  log: import("@engine/romance/RomanceState").RomanceTurnLog,
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
  decision: import("@engine/flow/FlowState").FlowDecision,
  turn: number,
): FlowDebugSnapshot {
  return {
    turn,
    state: decision.state,
    reasons: decision.reasons,
    shouldEndConversation: decision.shouldEndConversation,
    expectedReplyType: decision.expectedReplyType,
  };
}

function buildTurnSummaryDebug(input: {
  turn: number;
  emotionLog: import("@engine/emotion/EmotionManager").EmotionTurnLog;
  romanceLog: import("@engine/romance/RomanceState").RomanceTurnLog;
  flowDecision: FlowDecision;
  replyType: ReplyType;
  topicLabel: string;
  topicShiftTargetLabel?: string;
  conversationQuality: ConversationQualitySnapshot;
}): TurnSummaryDebugSnapshot {
  return {
    turn: input.turn,
    emotionChanges: input.emotionLog.changes
      .filter((change) => change.delta !== 0)
      .map((change) => ({
        field: change.field,
        delta: change.delta,
      })),
    romance: {
      previous: input.romanceLog.previousScore,
      current: input.romanceLog.newScore,
      delta: input.romanceLog.delta,
    },
    flow: {
      state: input.flowDecision.state,
      reasons: input.flowDecision.reasons,
    },
    replyType: input.replyType,
    topic: {
      current: input.topicLabel,
      shiftTarget: input.topicShiftTargetLabel ?? null,
    },
    conversationQuality: input.conversationQuality,
  };
}

const EMOTION_FIELD_LABELS: Record<string, string> = {
  comfort: "Comfort",
  interest: "Interest",
  tension: "Tension",
  guard: "Guard",
  fatigue: "Fatigue",
};

function logTurnSummary(summary: TurnSummaryDebugSnapshot): void {
  const emotionLines =
    summary.emotionChanges.length > 0
      ? summary.emotionChanges
          .map(
            (change) =>
              `${EMOTION_FIELD_LABELS[change.field] ?? change.field} ${change.delta >= 0 ? "+" : ""}${change.delta}`,
          )
          .join("\n")
      : "??????";

  logger.info(
    [
      `Turn${summary.turn}`,
      "Emotion",
      emotionLines,
      "Romance",
      `${summary.romance.previous}?${summary.romance.current}`,
      "Flow",
      summary.flow.state,
      "ReplyType",
      summary.replyType,
      "Topic",
      summary.topic.shiftTarget
        ? `${summary.topic.current} ? ${summary.topic.shiftTarget}`
        : summary.topic.current,
      "ConversationQuality",
      `Question ${summary.conversationQuality.question}`,
      `Empathy ${summary.conversationQuality.empathy}`,
      `TopicDepth ${summary.conversationQuality.topicDepth}`,
      `Reaction ${summary.conversationQuality.reaction}`,
    ].join("\n"),
  );
}
