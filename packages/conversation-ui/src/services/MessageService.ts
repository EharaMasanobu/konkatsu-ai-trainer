import type { Session } from "@konkatsu/shared-types";
import type { MessageRequest, MessageResponse } from "@konkatsu/shared-types";
import type { ConversationHistoryMessage } from "@konkatsu/shared-types";

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
