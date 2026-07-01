import { ConversationAI } from "@/ai/ConversationAI";
import { ConversationDirector } from "@/ai/ConversationDirector";
import { OpenAIClient } from "@/ai/OpenAIClient";
import { PromptBuilder } from "@/ai/prompt/PromptBuilder";
import { AIStateManager } from "@/ai/state/AIStateManager";
import { ConversationService } from "@/services/ConversationService";

const aiStateManager = new AIStateManager();
const topicManager = aiStateManager.getTopicManager();
const memoryManager = aiStateManager.getMemoryManager();
const promptBuilder = new PromptBuilder();
const openAIClient = new OpenAIClient();

const conversationDirector = new ConversationDirector(
  aiStateManager,
  topicManager,
  memoryManager,
  promptBuilder,
  openAIClient,
);

const conversationService = new ConversationService(conversationDirector);
const conversationAI = new ConversationAI(conversationDirector, aiStateManager);

export {
  aiStateManager,
  conversationAI,
  conversationDirector,
  conversationService,
};
