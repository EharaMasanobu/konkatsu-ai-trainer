export type QualityGrade = "◎" | "〇" | "△" | "×";

export interface ConversationQualitySnapshot {
  question: QualityGrade;
  empathy: QualityGrade;
  topicDepth: QualityGrade;
  reaction: QualityGrade;
}
