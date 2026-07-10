import { NextResponse } from "next/server";

import { processMessage } from "@/lib/conversationEngine";
import { isOpenAIConfigured, OPENAI_API_KEY_MISSING_MESSAGE } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { MessageRequest } from "@konkatsu/shared-types";

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
    const response = await processMessage(body);
    return NextResponse.json(response);
  } catch (error) {
    logger.error("OpenAI API Error", error);
    return NextResponse.json({ error: "OpenAI API Error" }, { status: 500 });
  }
}
