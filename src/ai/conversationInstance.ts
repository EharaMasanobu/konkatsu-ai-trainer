import { ConversationAI } from "@/ai/ConversationAI";
import { ConversationDirector } from "@/ai/ConversationDirector";
import { EmotionManager } from "@/ai/emotion/EmotionManager";
import { ConversationFlowManager } from "@/ai/flow/ConversationFlowManager";
import { RomanceManager } from "@/ai/romance/RomanceManager";
import { OpenAIClient } from "@/ai/OpenAIClient";
import { PromptBuilder } from "@/ai/prompt/PromptBuilder";
import { AIStateManager } from "@/ai/state/AIStateManager";
import { ConversationService } from "@/services/ConversationService";

const aiStateManager = new AIStateManager();
const emotionManager = new EmotionManager();
const romanceManager = new RomanceManager();
const flowManager = new ConversationFlowManager();
const topicManager = aiStateManager.getTopicManager();
const memoryManager = aiStateManager.getMemoryManager();
const promptBuilder = new PromptBuilder();
const openAIClient = new OpenAIClient();

const conversationDirector = new ConversationDirector(
  aiStateManager,
  topicManager,
  memoryManager,
  emotionManager,
  romanceManager,
  flowManager,
  promptBuilder,
  openAIClient,
);

const conversationService = new ConversationService(conversationDirector);
const conversationAI = new ConversationAI(conversationDirector, aiStateManager);

export {
  aiStateManager,
  emotionManager,
  romanceManager,
  flowManager,
  conversationAI,
  conversationDirector,
  conversationService,
};
