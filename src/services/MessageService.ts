import type { Session } from "@/types/session";
import type { MessageRequest, MessageResponse } from "@/types/messageApi";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";

export interface SendMessageInput {
  session: Session;
  conversationHistory: ConversationHistoryMessage[];
  latestMessage: string;
}

export class MessageService {
  async sendMessage(input: SendMessageInput): Promise<MessageResponse> {
    const body: MessageRequest = {
      message: input.latestMessage,
      session: {
        sessionId: input.session.sessionId,
        createdAt: input.session.createdAt.toISOString(),
        homeForm: input.session.homeForm,
      },
      conversationHistory: input.conversationHistory,
    };

    const response = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("メッセージの送信に失敗しました");
    }

    return response.json() as Promise<MessageResponse>;
  }
}
