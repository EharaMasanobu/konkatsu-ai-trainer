import type { TopicDebugSnapshot } from "@/types/messageApi";

interface TopicDebugPanelProps {
  topic: TopicDebugSnapshot;
}

export function TopicDebugPanel({ topic }: TopicDebugPanelProps) {
  return (
    <aside
      className="safe-x shrink-0 border-b border-sky-200 bg-sky-50/90 px-3 py-2 backdrop-blur-sm"
      aria-label="Topicデバッグ（Development）"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
        Dev · Topic
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-4">
        <div>
          <span className="text-sky-600">Current</span>
          <p className="font-semibold text-sky-900">{topic.currentTopic}</p>
        </div>
        <div>
          <span className="text-sky-600">Depth</span>
          <p className="font-mono font-semibold text-sky-900">{topic.depth}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-sky-600">Next</span>
          <p className="font-semibold text-sky-900">
            {topic.nextCandidate ?? "—"}
          </p>
        </div>
        <div className="col-span-2">
          <span className="text-sky-600">Completed</span>
          <p className="text-sky-900">{topic.completedTopics}</p>
        </div>
      </div>
    </aside>
  );
}
