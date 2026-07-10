export {
  clampEmotion,
  cloneFemaleEmotion,
  createInitialFemaleEmotion,
  FEMALE_EMOTION_INITIAL,
  FEMALE_EMOTION_LABELS,
  type FemaleEmotionKey,
  type FemaleEmotionState,
} from "@engine/emotion/FemaleEmotionState";
export {
  EmotionUpdateRule,
  type EmotionChangeEntry,
  type EmotionUpdateContext,
} from "@engine/emotion/EmotionUpdateRule";
export {
  formatEmotionLabelsForDebug,
  formatFemaleEmotionForEvaluation,
  formatFemaleEmotionForPrompt,
} from "@engine/emotion/EmotionPromptFormatter";
export { EmotionManager, type EmotionTurnLog } from "@engine/emotion/EmotionManager";
