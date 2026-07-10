import type { AIStateDebugSnapshot } from "@konkatsu/shared-types";

interface AIStateDebugPanelProps {
  state: AIStateDebugSnapshot;
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-600">{label}</span>
      <span className="font-mono font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

export function AIStateDebugPanel({ state }: AIStateDebugPanelProps) {
  return (
    <aside
      className="safe-x shrink-0 border-b border-amber-200 bg-amber-50/90 px-3 py-2 backdrop-blur-sm"
      aria-label="AI状態デバッグ（Development）"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        Dev · AI State
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        <MetricRow label="Interest" value={state.relationship.interest} />
        <MetricRow label="Trust" value={state.relationship.trust} />
        <MetricRow label="Comfort" value={state.relationship.comfort} />
        <MetricRow label="Romance" value={state.relationship.romance} />
        <MetricRow label="Happy" value={state.emotion.happy} />
        <MetricRow label="Curious" value={state.emotion.curious} />
        <MetricRow label="Nervous" value={state.emotion.nervous} />
        <MetricRow label="Surprised" value={state.emotion.surprised} />
      </div>
    </aside>
  );
}
