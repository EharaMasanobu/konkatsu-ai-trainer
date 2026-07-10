import type { Message } from "@konkatsu/shared-types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-base leading-relaxed whitespace-pre-wrap sm:max-w-[80%] sm:px-4 sm:py-3 ${
          isUser
            ? "rounded-br-md bg-rose-500 text-white"
            : "rounded-bl-md border border-zinc-200 bg-white text-zinc-900 shadow-sm"
        }`}
      >
        <p className="mb-0.5 text-[11px] font-medium opacity-70 sm:text-xs">
          {isUser ? "あなた" : "AI"}
        </p>
        <p>{message.content}</p>
      </div>
    </div>
  );
}
