/** 会話ルール・出力ルール */
import { PromptSectionBuilder } from "./PromptSectionBuilder";

export class ConversationPrompt {
  constructor(private readonly builder = new PromptSectionBuilder()) {}

  buildConversationRule(
    ...args: Parameters<PromptSectionBuilder["buildConversationRule"]>
  ) {
    return this.builder.buildConversationRule(...args);
  }

  buildOutputRule(...args: Parameters<PromptSectionBuilder["buildOutputRule"]>) {
    return this.builder.buildOutputRule(...args);
  }
}
