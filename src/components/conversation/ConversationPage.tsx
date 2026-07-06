"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AIStateDebugPanel } from "@/components/conversation/AIStateDebugPanel";
import { EmotionDebugPanel } from "@/components/conversation/EmotionDebugPanel";
import { FlowDebugPanel } from "@/components/conversation/FlowDebugPanel";
import { RomanceDebugPanel } from "@/components/conversation/RomanceDebugPanel";
import { MemoryDebugPanel } from "@/components/conversation/MemoryDebugPanel";
import { PromptDebugPanel } from "@/components/conversation/PromptDebugPanel";
import { TopicDebugPanel } from "@/components/conversation/TopicDebugPanel";
import { ConversationHeader } from "@/components/conversation/ConversationHeader";
import { MessageInput } from "@/components/conversation/MessageInput";
import { MessageList } from "@/components/conversation/MessageList";
import { VoiceRecorder } from "@/components/conversation/VoiceRecorder";
import { buttonSecondaryClassName } from "@/components/home/FormField";
import { EvaluationCard } from "@/components/evaluation/EvaluationCard";
import { useSession } from "@/contexts/SessionContext";
import { EvaluationService } from "@/services/EvaluationService";
import { MessageService } from "@/services/MessageService";
import type { Evaluation } from "@/types/Evaluation";
import type {
  AIStateDebugSnapshot,
  EmotionDebugSnapshot,
  FlowDebugSnapshot,
  MemoryDebugSnapshot,
  RomanceDebugSnapshot,
  TopicDebugSnapshot,
} from "@/types/messageApi";

const messageService = new MessageService();
const evaluationService = new EvaluationService();

type ConversationPhase = "conversation" | "evaluating" | "evaluation";

export function ConversationPage() {
  const router = useRouter();
  const { session, messages, addMessage, clearSession } = useSession();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<ConversationPhase>("conversation");
  const [currentTurn, setCurrentTurn] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [debugState, setDebugState] = useState<AIStateDebugSnapshot | null>(null);
  const [debugTopic, setDebugTopic] = useState<TopicDebugSnapshot | null>(null);
  const [debugMemory, setDebugMemory] = useState<MemoryDebugSnapshot | null>(null);
  const [debugEmotion, setDebugEmotion] = useState<EmotionDebugSnapshot | null>(null);
  const [debugRomance, setDebugRomance] = useState<RomanceDebugSnapshot | null>(null);
  const [debugFlow, setDebugFlow] = useState<FlowDebugSnapshot | null>(null);
  const [debugPromptPreview, setDebugPromptPreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isDev = process.env.NODE_ENV === "development";

  const minTurn = session?.homeForm.conversationSetting.minTurn ?? 0;
  const maxTurn = session?.homeForm.conversationSetting.maxTurn ?? 0;
  const userTurnCount = messages.filter((message) => message.role === "user").length;
  const displayTurn = currentTurn || userTurnCount;
  const canEndConversation =
    phase === "conversation" && userTurnCount >= minTurn && !isLoading;

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, phase]);

  const runEvaluation = useCallback(async () => {
    if (!session || messages.length === 0) {
      return;
    }

    setPhase("evaluating");
    setEvaluationError(null);

    const conversationHistory = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    try {
      const result = await evaluationService.evaluate({
        session,
        conversationHistory,
      });
      setEvaluation(result);
      setPhase("evaluation");
    } catch (error) {
      setEvaluationError(
        error instanceof Error ? error.message : "コーチング分析に失敗しました",
      );
      setPhase("conversation");
    }
  }, [messages, session]);

  const sendUserMessage = useCallback(
    async (trimmed: string) => {
      if (!trimmed || isLoading || !session || phase !== "conversation") {
        return;
      }

      const conversationHistory = messages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      addMessage({ role: "user", content: trimmed });
      setIsLoading(true);

      try {
        const {
          reply,
          shouldEnd,
          turn,
          debugState: nextDebugState,
          debugTopic: nextDebugTopic,
          debugMemory: nextDebugMemory,
          debugEmotion: nextDebugEmotion,
          debugRomance: nextDebugRomance,
          debugFlow: nextDebugFlow,
          debugPromptPreview: nextDebugPromptPreview,
        } = await messageService.sendMessage({
          session,
          conversationHistory,
          latestMessage: trimmed,
        });
        addMessage({ role: "assistant", content: reply });
        setCurrentTurn(turn);

        if (isDev && nextDebugState) {
          setDebugState(nextDebugState);
        }
        if (isDev && nextDebugTopic) {
          setDebugTopic(nextDebugTopic);
        }
        if (isDev && nextDebugMemory) {
          setDebugMemory(nextDebugMemory);
        }
        if (isDev && nextDebugEmotion) {
          setDebugEmotion(nextDebugEmotion);
        }
        if (isDev && nextDebugRomance) {
          setDebugRomance(nextDebugRomance);
        }
        if (isDev && nextDebugFlow) {
          setDebugFlow(nextDebugFlow);
        }
        if (isDev && nextDebugPromptPreview) {
          setDebugPromptPreview(nextDebugPromptPreview);
        }

        if (shouldEnd) {
          await runEvaluation();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, session, messages, addMessage, phase, runEvaluation, isDev],
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setInput("");
    await sendUserMessage(trimmed);
  }, [input, sendUserMessage]);

  const handleVoiceTranscript = useCallback(
    async (text: string) => {
      await sendUserMessage(text.trim());
    },
    [sendUserMessage],
  );

  const handleEndConversation = useCallback(async () => {
    if (!canEndConversation) {
      return;
    }

    await runEvaluation();
  }, [canEndConversation, runEvaluation]);

  const handleBackHome = useCallback(() => {
    clearSession();
    router.replace("/");
  }, [clearSession, router]);

  if (!session) {
    return null;
  }

  if (phase === "evaluating") {
    return (
      <main className="page-shell flex min-h-dvh flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-rose-500" />
          <p className="text-lg font-semibold text-zinc-800">
            婚活アドバイザーが分析しています...
          </p>
          <p className="text-sm leading-relaxed text-zinc-500">
            会話をターンごとに振り返っています。少々お待ちください。
          </p>
        </div>
      </main>
    );
  }

  if (phase === "evaluation" && evaluation) {
    return (
      <main className="page-shell safe-top min-h-dvh pb-6">
        <div className="mx-auto w-full max-w-lg sm:max-w-3xl">
          <EvaluationCard evaluation={evaluation} onBackHome={handleBackHome} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-zinc-100">
      <ConversationHeader currentTurn={displayTurn} maxTurn={maxTurn} />

      {isDev && debugState && <AIStateDebugPanel state={debugState} />}
      {isDev && debugEmotion && <EmotionDebugPanel emotion={debugEmotion} />}
      {isDev && debugRomance && <RomanceDebugPanel romance={debugRomance} />}
      {isDev && debugFlow && <FlowDebugPanel flow={debugFlow} />}
      {isDev && debugTopic && <TopicDebugPanel topic={debugTopic} />}
      {isDev && debugMemory && <MemoryDebugPanel memory={debugMemory} />}
      {isDev && debugPromptPreview && (
        <PromptDebugPanel preview={debugPromptPreview} />
      )}

      {evaluationError && (
        <div
          role="alert"
          className="safe-x shrink-0 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{evaluationError}</p>
          <button
            type="button"
            onClick={() => void runEvaluation()}
            className="touch-target mt-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 active:bg-red-50"
          >
            再実行
          </button>
        </div>
      )}

      <section className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col sm:max-w-3xl">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          bottomRef={bottomRef}
        />
      </section>

      <footer className="safe-bottom safe-x shrink-0 border-t border-zinc-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="border-b border-zinc-100 py-3">
          <VoiceRecorder
            compact
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-end gap-2 py-3">
          <div className="min-w-0 flex-1">
            <MessageInput
              value={input}
              onChange={setInput}
              disabled={isLoading}
              onSubmit={() => void handleSend()}
            />
          </div>

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isLoading || !input.trim()}
            className="touch-target flex h-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white active:bg-rose-700 disabled:bg-zinc-300"
          >
            送信
          </button>
        </div>

        {canEndConversation && (
          <button
            type="button"
            onClick={() => void handleEndConversation()}
            className={`${buttonSecondaryClassName} mb-3 text-sm`}
          >
            会話を終了してコーチングへ
          </button>
        )}
      </footer>
    </main>
  );
}
