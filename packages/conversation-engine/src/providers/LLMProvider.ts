export interface LLMChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  json?: boolean;
}

export interface LLMProvider {
  readonly name: string;
  chat(messages: LLMChatMessage[], options?: LLMChatOptions): Promise<string>;
}
