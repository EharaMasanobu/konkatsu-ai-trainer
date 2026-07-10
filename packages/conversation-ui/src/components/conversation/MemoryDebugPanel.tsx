import { getMemoryCategoryLabel } from "@konkatsu/shared-types";
import type { MemoryDebugSnapshot } from "@konkatsu/shared-types";

interface MemoryDebugPanelProps {
  memory: MemoryDebugSnapshot;
}

function MemorySection({
  title,
  items,
}: {
  title: string;
  items: MemoryDebugSnapshot["longTerm"];
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="mb-1 text-[10px] font-semibold text-violet-700">{title}</p>
        <p className="text-xs text-violet-500">なし</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold text-violet-700">{title}</p>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li
            key={`${item.value}-${index}`}
            className="rounded border border-violet-100 bg-white/80 px-2 py-1 text-xs"
          >
            <p className="font-medium text-violet-900">{item.value}</p>
            <p className="text-violet-600">
              {getMemoryCategoryLabel(
                item.category as import("@konkatsu/shared-types").MemoryCategory,
              )}{" "}
              · imp {item.importance}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MemoryDebugPanel({ memory }: MemoryDebugPanelProps) {
  return (
    <aside
      className="safe-x shrink-0 border-b border-violet-200 bg-violet-50/90 px-3 py-2 backdrop-blur-sm"
      aria-label="Memoryデバッグ（Development）"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
        Dev · Memory
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <MemorySection title="LongTerm" items={memory.longTerm} />
        <MemorySection title="ShortTerm" items={memory.shortTerm} />
      </div>
    </aside>
  );
}
