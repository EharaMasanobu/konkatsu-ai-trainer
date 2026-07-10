import { NextResponse } from "next/server";

import { engine } from "@/lib/conversationEngine";
import { isOpenAIConfigured, OPENAI_API_KEY_MISSING_MESSAGE } from "@/lib/env";
import { logger } from "@/lib/logger";
import type {
  EvaluateErrorResponse,
  EvaluateRequest,
  EvaluateResponse,
} from "@konkatsu/shared-types";
import type { Session } from "@konkatsu/shared-types";

function toSession(payload: EvaluateRequest["session"]): Session {
  return {
    sessionId: payload.sessionId,
    createdAt: new Date(payload.createdAt),
    homeForm: payload.homeForm,
  };
}

export async function POST(request: Request) {
  let body: EvaluateRequest;

  try {
    body = (await request.json()) as EvaluateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" } satisfies EvaluateErrorResponse, {
      status: 400,
    });
  }

  if (!body.session) {
    return NextResponse.json(
      { error: "session is required" } satisfies EvaluateErrorResponse,
      { status: 400 },
    );
  }

  if (!Array.isArray(body.conversationHistory)) {
    return NextResponse.json(
      { error: "conversationHistory is required" } satisfies EvaluateErrorResponse,
      { status: 400 },
    );
  }

  if (body.conversationHistory.length === 0) {
    return NextResponse.json(
      { error: "conversationHistory must not be empty" } satisfies EvaluateErrorResponse,
      { status: 400 },
    );
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: OPENAI_API_KEY_MISSING_MESSAGE } satisfies EvaluateErrorResponse,
      { status: 503 },
    );
  }

  try {
    const session = toSession(body.session);
    const aiState = engine.aiStateManager.get(session.sessionId);
    const femaleEmotion = engine.emotionManager.get(session.sessionId);
    const romance = engine.romanceManager.buildFinalResult(session.sessionId);

    const evaluation = await engine.evaluate({
      session,
      conversationHistory: body.conversationHistory,
      aiState,
      femaleEmotion,
      romance,
    });

    const response: EvaluateResponse = { evaluation };
    return NextResponse.json(response);
  } catch (error) {
    logger.error("EvaluationAI Error", error);
    const message =
      error instanceof Error ? error.message : "コーチング分析に失敗しました";

    return NextResponse.json(
      { error: message } satisfies EvaluateErrorResponse,
      { status: 500 },
    );
  }
}
