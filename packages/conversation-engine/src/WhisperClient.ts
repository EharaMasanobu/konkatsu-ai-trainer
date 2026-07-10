import OpenAI from "openai";
import type { Uploadable } from "openai/uploads";

import {
  WHISPER_MODEL,
  WHISPER_MODEL_FALLBACK,
} from "@engine/constants/openai";
import { getOpenAIApiKey } from "@engine/utils/env";
import { logger } from "@engine/utils/logger";

function resolveApiKey(explicit?: string): string | undefined {
  if (explicit !== undefined && explicit.trim() !== "") {
    return explicit.trim();
  }

  const key = process.env.OPENAI_API_KEY;
  if (key === undefined || key.trim() === "") {
    return undefined;
  }

  return key.trim();
}

export class WhisperClient {
  private readonly client: OpenAI | null;

  constructor(apiKey?: string) {
    const key = resolveApiKey(apiKey);
    this.client = key ? new OpenAI({ apiKey: key }) : null;
  }

  async transcribe(audioFile: Uploadable): Promise<string> {
    try {
      return await this.transcribeWithModel(audioFile, WHISPER_MODEL);
    } catch (error) {
      logger.warn("Whisper primary model failed, falling back", error);
      return this.transcribeWithModel(audioFile, WHISPER_MODEL_FALLBACK);
    }
  }

  private async transcribeWithModel(
    audioFile: Uploadable,
    model: string,
  ): Promise<string> {
    if (!this.client) {
      getOpenAIApiKey();
    }

    const response = await this.client!.audio.transcriptions.create({
      file: audioFile,
      model,
      language: "ja",
      response_format: "json",
    });

    const text = response.text.trim();

    if (!text) {
      throw new Error("Whisper returned empty transcription");
    }

    return text;
  }
}
