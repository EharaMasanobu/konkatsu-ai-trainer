import { NextResponse } from "next/server";

import { conversationService } from "@/ai/conversationInstance";
import { isOpenAIConfigured, OPENAI_API_KEY_MISSING_MESSAGE } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { MessageRequest, MessageResponse } from "@/types/messageApi";
import type { Session } from "@/types/session";

function toSession(payload: MessageRequest["session"]): Session {
  return {
    sessionId: payload.sessionId,
    createdAt: new Date(payload.createdAt),
    homeForm: payload.homeForm,
  };
}

export async function POST(request: Request) {
  let body: MessageRequest;

  try {
    body = (await request.json()) as MessageRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (!body.session) {
    return NextResponse.json({ error: "session is required" }, { status: 400 });
  }

  if (!Array.isArray(body.conversationHistory)) {
    return NextResponse.json(
      { error: "conversationHistory is required" },
      { status: 400 },
    );
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: OPENAI_API_KEY_MISSING_MESSAGE },
      { status: 503 },
    );
  }

  try {
    const result = await conversationService.processTurn({
      session: toSession(body.session),
      conversationHistory: body.conversationHistory,
      userMessage: body.message,
    });

    const response: MessageResponse = {
      reply: result.reply,
      shouldEnd: result.shouldEnd,
      turn: result.turn,
      ...(result.debugState
        ? {
            debugState: {
              relationship: result.debugState.relationship,
              emotion: result.debugState.emotion,
            },
          }
        : {}),
      ...(result.debugTopic ? { debugTopic: result.debugTopic } : {}),
      ...(result.debugMemory ? { debugMemory: result.debugMemory } : {}),
      ...(result.debugPromptPreview
        ? { debugPromptPreview: result.debugPromptPreview }
        : {}),
    };
    return NextResponse.json(response);
  } catch (error) {
    logger.error("OpenAI API Error", error);
    return NextResponse.json({ error: "OpenAI API Error" }, { status: 500 });
  }
}
