import { EvaluationAI } from "@/ai/EvaluationAI";
import { EvaluationManager } from "@/ai/EvaluationManager";
import { emotionManager, romanceManager } from "@/ai/conversationInstance";

export const evaluationManager = new EvaluationManager(
  new EvaluationAI(),
  emotionManager,
  romanceManager,
);

/** @deprecated EvaluationManager を使用してください */
export const evaluationAI = evaluationManager;
