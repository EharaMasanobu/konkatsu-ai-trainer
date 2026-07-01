import OpenAI from "openai";
import type { Uploadable } from "openai/uploads";

import {
  WHISPER_MODEL,
  WHISPER_MODEL_FALLBACK,
} from "@/constants/openai";
import { getEnv, getOpenAIApiKey } from "@/lib/env";
import { logger } from "@/lib/logger";

export class WhisperClient {
  private readonly client: OpenAI | null;

  constructor(apiKey?: string) {
    const key = apiKey ?? getEnv("OPENAI_API_KEY");
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
