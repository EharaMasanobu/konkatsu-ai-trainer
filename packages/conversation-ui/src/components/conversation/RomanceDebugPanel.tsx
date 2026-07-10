"use client";

import type { RomanceDebugSnapshot } from "@konkatsu/shared-types";

interface RomanceDebugPanelProps {
  romance: RomanceDebugSnapshot;
}

export function RomanceDebugPanel({ romance }: RomanceDebugPanelProps) {
  const deltaLabel = `${romance.delta >= 0 ? "+" : ""}${romance.delta}`;

  return (
    <aside
      className="safe-x shrink-0 border-b border-pink-200 bg-pink-50/90 px-3 py-2 backdrop-blur-sm"
      aria-label="恋愛度デバッグ（Development）"
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-pink-700">
        Dev · Romance (Turn {romance.turn})
      </p>
      <p className="font-mono text-sm text-pink-900">
        {romance.previousScore} → {romance.newScore}{" "}
        <span className="text-pink-700">({deltaLabel})</span>
      </p>
      {romance.reasons.length > 0 && (
        <p className="mt-1 text-[10px] leading-relaxed text-pink-800">
          理由: {romance.reasons.join(" / ")}
        </p>
      )}
    </aside>
  );
}
