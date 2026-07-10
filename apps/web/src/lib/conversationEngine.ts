import { ConversationEngine } from "@konkatsu/conversation-engine";
import type { Session } from "@konkatsu/shared-types";
import type {
  MessageRequest,
  MessageResponse,
} from "@konkatsu/shared-types";

const engine = new ConversationEngine();

function toSession(payload: MessageRequest["session"]): Session {
  return {
    sessionId: payload.sessionId,
    createdAt: new Date(payload.createdAt),
    homeForm: payload.homeForm,
  };
}

export async function processMessage(body: MessageRequest): Promise<MessageResponse> {
  const result = await engine.processTurn({
    session: toSession(body.session),
    conversationHistory: body.conversationHistory,
    userMessage: body.message,
  });

  return {
    reply: result.reply,
    shouldEnd: result.shouldEnd,
    turn: result.turn,
    ...(result.debugState
      ? {
          debugState: {
            relationship: result.debugState.relationship,
            emotion: result.debugState.emotion,
          },
        }
      : {}),
    ...(result.debugTopic ? { debugTopic: result.debugTopic } : {}),
    ...(result.debugMemory ? { debugMemory: result.debugMemory } : {}),
    ...(result.debugPromptPreview
      ? { debugPromptPreview: result.debugPromptPreview }
      : {}),
    ...(result.debugEmotion ? { debugEmotion: result.debugEmotion } : {}),
    ...(result.debugRomance ? { debugRomance: result.debugRomance } : {}),
    ...(result.debugFlow ? { debugFlow: result.debugFlow } : {}),
    ...(result.debugTurnSummary
      ? { debugTurnSummary: result.debugTurnSummary }
      : {}),
  };
}

export { engine };
