/** 話題セクション */
import { PromptSectionBuilder } from "./PromptSectionBuilder";

export class TopicPrompt {
  constructor(private readonly builder = new PromptSectionBuilder()) {}

  build(...args: Parameters<PromptSectionBuilder["buildTopic"]>) {
    return this.builder.buildTopic(...args);
  }
}
