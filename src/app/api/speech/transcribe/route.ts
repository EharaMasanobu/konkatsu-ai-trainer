import { NextResponse } from "next/server";

import { WhisperClient } from "@/ai/WhisperClient";
import { logger } from "@/lib/logger";
import type { TranscribeResponse } from "@/types/speechApi";

const whisperClient = new WhisperClient();

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const audio = formData.get("audio");

  if (!audio || !(audio instanceof File)) {
    return NextResponse.json({ error: "audio is required" }, { status: 400 });
  }

  if (audio.size === 0) {
    return NextResponse.json({ error: "audio file is empty" }, { status: 400 });
  }

  try {
    const text = await whisperClient.transcribe(audio);
    const response: TranscribeResponse = { text };
    return NextResponse.json(response);
  } catch (error) {
    logger.error("Whisper API Error", error);
    return NextResponse.json(
      { error: "音声の文字起こしに失敗しました" },
      { status: 500 },
    );
  }
}
