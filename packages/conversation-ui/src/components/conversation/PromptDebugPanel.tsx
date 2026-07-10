interface PromptDebugPanelProps {
  preview: string;
}

export function PromptDebugPanel({ preview }: PromptDebugPanelProps) {
  return (
    <details
      className="safe-x shrink-0 border-b border-amber-200 bg-amber-50/90 px-3 py-2 backdrop-blur-sm"
      aria-label="Promptプレビュー（Development）"
    >
      <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wide text-amber-800">
        Dev · Prompt Preview（送信前）
      </summary>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded border border-amber-100 bg-white/90 p-2 font-mono text-[10px] leading-relaxed text-amber-950">
        {preview}
      </pre>
    </details>
  );
}
