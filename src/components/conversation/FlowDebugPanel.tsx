"use client";

import { FLOW_STATE_LABELS, type FlowState } from "@/ai/flow/FlowState";
import type { FlowDebugSnapshot } from "@/types/messageApi";

interface FlowDebugPanelProps {
  flow: FlowDebugSnapshot;
}

export function FlowDebugPanel({ flow }: FlowDebugPanelProps) {
  const label = FLOW_STATE_LABELS[flow.state as FlowState] ?? flow.state;

  return (
    <aside
      className="safe-x shrink-0 border-b border-sky-200 bg-sky-50/90 px-3 py-2 backdrop-blur-sm"
      aria-label="会話フローデバッグ（Development）"
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
        Dev · Flow (Turn {flow.turn})
        {flow.shouldEndConversation ? " · END" : ""}
      </p>
      <p className="font-mono text-sm font-semibold text-sky-900">
        {flow.state}
        <span className="ml-2 text-xs font-normal text-sky-700">({label})</span>
      </p>
      {flow.reasons.length > 0 && (
        <p className="mt-1 text-[10px] leading-relaxed text-sky-800">
          理由: {flow.reasons.join(" / ")}
        </p>
      )}
    </aside>
  );
}
