"use client";

import { FLOW_STATE_LABELS, type FlowState } from "@konkatsu/shared-types";
import type { TurnSummaryDebugSnapshot } from "@konkatsu/shared-types";

interface TurnSummaryDebugPanelProps {
  summary: TurnSummaryDebugSnapshot;
}

const EMOTION_LABELS: Record<string, string> = {
  comfort: "Comfort",
  interest: "Interest",
  tension: "Tension",
  guard: "Guard",
  fatigue: "Fatigue",
};

export function TurnSummaryDebugPanel({ summary }: TurnSummaryDebugPanelProps) {
  const flowLabel =
    FLOW_STATE_LABELS[summary.flow.state as FlowState] ?? summary.flow.state;

  return (
    <aside
      className="safe-x shrink-0 border-b border-violet-200 bg-violet-50/90 px-3 py-2 font-mono text-xs backdrop-blur-sm"
      aria-label="ターンサマリーデバッグ（Development）"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
        Dev · Turn Summary
      </p>
      <p className="font-semibold text-violet-900">Turn{summary.turn}</p>

      <div className="mt-2 space-y-2 text-violet-900">
        <div>
          <p className="font-semibold">Emotion</p>
          {summary.emotionChanges.length === 0 ? (
            <p className="text-violet-700">（変化なし）</p>
          ) : (
            summary.emotionChanges.map((change) => (
              <p key={change.field}>
                {EMOTION_LABELS[change.field] ?? change.field}{" "}
                {change.delta >= 0 ? "+" : ""}
                {change.delta}
              </p>
            ))
          )}
        </div>

        <div>
          <p className="font-semibold">Romance</p>
          <p>
            {summary.romance.previous}→{summary.romance.current}
          </p>
        </div>

        <div>
          <p className="font-semibold">Flow</p>
          <p>
            {summary.flow.state}
            <span className="ml-1 text-violet-700">({flowLabel})</span>
          </p>
        </div>

        <div>
          <p className="font-semibold">ReplyType</p>
          <p>{summary.replyType}</p>
        </div>

        <div>
          <p className="font-semibold">Topic</p>
          <p>
            {summary.topic.shiftTarget
              ? `${summary.topic.current} → ${summary.topic.shiftTarget}`
              : summary.topic.current}
          </p>
        </div>

        <div>
          <p className="font-semibold">ConversationQuality</p>
          <p>Question {summary.conversationQuality.question}</p>
          <p>Empathy {summary.conversationQuality.empathy}</p>
          <p>TopicDepth {summary.conversationQuality.topicDepth}</p>
          <p>Reaction {summary.conversationQuality.reaction}</p>
        </div>
      </div>
    </aside>
  );
}
