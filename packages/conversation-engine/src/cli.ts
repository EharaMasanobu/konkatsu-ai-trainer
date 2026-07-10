#!/usr/bin/env node
/**
 * CLI テスト用エントリポイント
 * 使用例: pnpm --filter @konkatsu/conversation-engine cli
 */
import { ConversationEngine } from "./ConversationEngine";

async function main() {
  const engine = new ConversationEngine();
  const sessionId = `cli-${Date.now()}`;
  engine.initialize(sessionId);
  console.log("ConversationEngine initialized:", sessionId);
  console.log("Managers:", {
    emotion: !!engine.emotionManager,
    romance: !!engine.romanceManager,
    flow: !!engine.flowManager,
    topic: !!engine.topicManager,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
