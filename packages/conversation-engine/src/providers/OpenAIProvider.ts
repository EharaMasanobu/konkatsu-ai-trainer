import OpenAI from "openai";

import { GPT_MODEL } from "@engine/constants/openai";
import type {
  LLMChatMessage,
  LLMChatOptions,
  LLMProvider,
} from "@engine/providers/LLMProvider";
import { getOpenAIApiKey } from "@engine/utils/env";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";

  constructor(
    private readonly apiKey?: string,
    private readonly defaultModel: string = GPT_MODEL,
  ) {}

  async chat(
    messages: LLMChatMessage[],
    options?: LLMChatOptions,
  ): Promise<string> {
    const client = new OpenAI({
      apiKey: this.apiKey ?? getOpenAIApiKey(),
    });

    const response = await client.chat.completions.create({
      model: options?.model ?? this.defaultModel,
      messages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      ...(options?.json ? { response_format: { type: "json_object" } } : {}),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }
    return content;
  }
}

/** @deprecated OpenAIProvider を使用 */
export class OpenAIClient extends OpenAIProvider {
  async chatJson(messages: LLMChatMessage[]): Promise<string> {
    return this.chat(messages, { json: true });
  }
}

export { GPT_MODEL };
