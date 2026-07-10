import type { ReplyType } from "@engine/conversation/ReplyType";
import type { CharacterReplyStyle } from "@engine/constants/characterReplyStyles";
import { CHARACTER_REPLY_STYLE_GUIDANCE } from "@engine/constants/characterReplyStyles";
import type { ConversationDifficulty } from "@engine/constants/conversationDifficulty";
import type { FlowState } from "@engine/flow/FlowState";
import { getFlowSentenceLimit } from "@engine/constants/conversationDifficulty";

export function formatReplyTypeGuidance(
  replyType: ReplyType,
  flowState: FlowState,
  characterStyle: CharacterReplyStyle,
  difficulty: ConversationDifficulty,
  topicShiftTargetLabel?: string,
): string {
  const limits = getFlowSentenceLimit(difficulty, flowState);
  const lines = [
    `【今ターンの返答タイプ: ${replyType}】`,
    `・文数: ${limits.min}〜${limits.max}文`,
    "",
    ...getReplyTypeStructure(replyType, topicShiftTargetLabel),
    "",
    ...CHARACTER_REPLY_STYLE_GUIDANCE[characterStyle],
  ];

  return lines.join("\n");
}

function getReplyTypeStructure(
  replyType: ReplyType,
  topicShiftTargetLabel?: string,
): string[] {
  switch (replyType) {
    case "AnswerOnly":
      return [
        "・構造: 回答のみ（1文）",
        "・補足は入れない、または極めて短く",
      ];
    case "AnswerReaction":
      return [
        "・構造: リアクション → 回答",
        "・例:「そうなんですね。映画は好きです。」",
      ];
    case "AnswerDetail":
      return [
        "・構造: 回答 → 補足1文",
        "・例:「はい、好きですね。特にケーキはよく食べます。」",
      ];
    case "AnswerDetailQuestion":
      return [
        "・構造: 回答 → 補足 → 質問1つ",
        "・質問は最後に1つだけ",
      ];
    case "TopicShift":
      return [
        "・構造: 回答 → 補足 → 自然な繋ぎ → 次の話題",
        "・繋ぎ例:「そういえば」「ところで」「そういった話で思い出しましたが」",
        topicShiftTargetLabel
          ? `・次の話題: 「${topicShiftTargetLabel}」へ自然に移る`
          : "・今の話題に答えてから、関連する話題へ橋をかける",
        "・突然話題を変えない",
      ];
    case "ShortReply":
      return ["・構造: 短い返答（1文）", "・リアクション＋短い答えでもよい"];
    case "WaitingReply":
      return [
        "・構造: 短い待機返答",
        "・「そうですね。」「はい。」程度",
      ];
    case "Silence":
      return ["・構造: 沈黙・極短", "・「……」「うん」程度"];
    case "Ending":
      return ["・構造: お礼・締めの言葉", "・新しい話題は出さない"];
  }
}
