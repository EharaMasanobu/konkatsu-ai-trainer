import type { RefObject } from "react";

import { LoadingMessage } from "../conversation/LoadingMessage";
import { MessageBubble } from "../conversation/MessageBubble";
import type { Message } from "@konkatsu/shared-types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export function MessageList({
  messages,
  isLoading,
  bottomRef,
}: MessageListProps) {
  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6">
      {messages.length === 0 && !isLoading && (
        <p className="py-8 text-center text-sm text-zinc-400">
          メッセージを入力して会話を始めましょう
        </p>
      )}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <LoadingMessage />}
      <div ref={bottomRef} className="h-1 shrink-0" />
    </div>
  );
}
