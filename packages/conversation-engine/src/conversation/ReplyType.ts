/** 女性返答の内部タイプ（Version3.2） */
export type ReplyType =
  | "AnswerOnly"
  | "AnswerReaction"
  | "AnswerDetail"
  | "AnswerDetailQuestion"
  | "TopicShift"
  | "ShortReply"
  | "WaitingReply"
  | "Silence"
  | "Ending";

export const REPLY_TYPE_LABELS: Record<ReplyType, string> = {
  AnswerOnly: "AnswerOnly",
  AnswerReaction: "AnswerReaction",
  AnswerDetail: "AnswerDetail",
  AnswerDetailQuestion: "AnswerDetailQuestion",
  TopicShift: "TopicShift",
  ShortReply: "ShortReply",
  WaitingReply: "WaitingReply",
  Silence: "Silence",
  Ending: "Ending",
};
