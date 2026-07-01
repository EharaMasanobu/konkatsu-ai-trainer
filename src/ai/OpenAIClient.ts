import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { GPT_MODEL } from "@/constants/openai";
import { getEnv, getOpenAIApiKey } from "@/lib/env";

export { GPT_MODEL };

export class OpenAIClient {
  private readonly client: OpenAI | null;

  constructor(apiKey?: string) {
    const key = apiKey ?? getEnv("OPENAI_API_KEY");
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
