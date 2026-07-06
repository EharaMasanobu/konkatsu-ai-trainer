export {
  clampEmotion,
  cloneFemaleEmotion,
  createInitialFemaleEmotion,
  FEMALE_EMOTION_INITIAL,
  FEMALE_EMOTION_LABELS,
  type FemaleEmotionKey,
  type FemaleEmotionState,
} from "@/ai/emotion/FemaleEmotionState";
export {
  EmotionUpdateRule,
  type EmotionChangeEntry,
  type EmotionUpdateContext,
} from "@/ai/emotion/EmotionUpdateRule";
export {
  formatEmotionLabelsForDebug,
  formatFemaleEmotionForEvaluation,
  formatFemaleEmotionForPrompt,
} from "@/ai/emotion/EmotionPromptFormatter";
export { EmotionManager, type EmotionTurnLog } from "@/ai/emotion/EmotionManager";
