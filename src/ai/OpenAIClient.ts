import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { GPT_MODEL } from "@/constants/openai";
import { getOpenAIApiKey } from "@/lib/env";

export { GPT_MODEL };

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

export class OpenAIClient {
  private readonly client: OpenAI | null;

  constructor(apiKey?: string) {
    const key = resolveApiKey(apiKey);
    this.client = key ? new OpenAI({ apiKey: key }) : null;
  }

  async chat(messages: ChatCompletionMessageParam[]): Promise<string> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: GPT_MODEL,
      messages,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    return content;
  }

  async chatJson(messages: ChatCompletionMessageParam[]): Promise<string> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: GPT_MODEL,
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned empty JSON content");
    }

    return content;
  }

  private getClient(): OpenAI {
    if (!this.client) {
      getOpenAIApiKey();
    }
    return this.client!;
  }
}
