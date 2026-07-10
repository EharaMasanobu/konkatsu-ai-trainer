"use client";

import {
  FEMALE_EMOTION_LABELS,
  type FemaleEmotionKey,
  type FemaleEmotionState,
} from "@konkatsu/shared-types";
import type { EmotionDebugSnapshot } from "@konkatsu/shared-types";

interface EmotionDebugPanelProps {
  emotion: EmotionDebugSnapshot;
}

function EmotionBar({ label, value }: { label: string; value: number }) {
  const filled = Math.round(value / 10);
  const bar = "■".repeat(filled) + "□".repeat(10 - filled);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-violet-800">{label}</span>
        <span className="font-mono font-semibold text-violet-950">{value}</span>
      </div>
      <p className="font-mono text-sm tracking-tight text-violet-700">{bar}</p>
    </div>
  );
}

const EMOTION_ORDER: FemaleEmotionKey[] = [
  "comfort",
  "interest",
  "guard",
  "fatigue",
  "tension",
];

export function EmotionDebugPanel({ emotion }: EmotionDebugPanelProps) {
  return (
    <aside
      className="safe-x shrink-0 border-b border-violet-200 bg-violet-50/90 px-3 py-2 backdrop-blur-sm"
      aria-label="感情デバッグ（Development）"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
        Dev · Emotion (Turn {emotion.turn})
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {EMOTION_ORDER.map((key) => (
          <EmotionBar
            key={key}
            label={FEMALE_EMOTION_LABELS[key]}
            value={emotion.state[key]}
          />
        ))}
      </div>

      {emotion.changes.length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border-violet-200 pt-2">
          <p className="text-[10px] font-semibold text-violet-700">直近の変化</p>
          {emotion.changes.map((change, index) => (
            <p key={`${change.field}-${index}`} className="text-[10px] text-violet-800">
              {FEMALE_EMOTION_LABELS[change.field]}{" "}
              {change.delta >= 0 ? "+" : ""}
              {change.delta} — {change.reason}
            </p>
          ))}
        </div>
      )}
    </aside>
  );
}

/** 感情状態のみ表示（評価画面等での将来利用向け） */
export function EmotionStateBars({ state }: { state: FemaleEmotionState }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {EMOTION_ORDER.map((key) => (
        <EmotionBar
          key={key}
          label={FEMALE_EMOTION_LABELS[key]}
          value={state[key]}
        />
      ))}
    </div>
  );
}
