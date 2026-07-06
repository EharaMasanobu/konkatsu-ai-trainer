import type { FlowState } from "@/ai/flow/FlowState";

export function formatFlowStateForPrompt(state: FlowState): string {
  const lines = [
    "以下は今ターンの会話フロー指示です。最優先で従ってください。",
    "女性は会話を成立させるAIではありません。男性が頑張らなければ会話は止まって構いません。",
    "",
    getStateGuidance(state),
  ];

  if (state === "SILENCE") {
    lines.push(
      "",
      "【返答例】",
      "「……」",
      "「そうですね。」",
      "「はい。」",
    );
  }

  if (state === "ENDING") {
    lines.push(
      "",
      "【終了の返答例】",
      "「今日はありがとうございました。」",
      "「お話できてよかったです。」",
    );
  }

  return lines.join("\n");
}

function getStateGuidance(state: FlowState): string {
  switch (state) {
    case "NORMAL":
      return [
        "【NORMAL — 会話継続】",
        "・聞かれたことに自然に答える。",
        "・返答は1〜2文。会話をリードしない。",
      ].join("\n");
    case "SHORT_REPLY":
      return [
        "【SHORT_REPLY — 短く返答】",
        "・返答は極力短く（5〜20文字程度でもよい）。",
        "・自分から話題を出さない。",
      ].join("\n");
    case "SILENCE":
      return [
        "【SILENCE — 少し沈黙】",
        "・すぐ話題を出さない。",
        "・相槌・短い返事だけでよい。",
        "・会話を救わない。",
      ].join("\n");
    case "WAITING":
      return [
        "【WAITING — 待機中】",
        "・女性は待っています。話題は広げません。",
        "・男性が質問しない限り、短く返してください。",
        "・「……」「うん」程度でもよい。",
      ].join("\n");
    case "QUESTION":
      return [
        "【QUESTION — 質問可】",
        "・女性は少し興味があります。",
        "・質問しても構いません（1つまで）。",
        "・それでも主導権は男性側です。",
      ].join("\n");
    case "TOPIC_SHIFT":
      return [
        "【TOPIC_SHIFT — 軽い話題転換】",
        "・今の話題から自然に、軽く別の話題へ橋をかけてよい。",
        "・長く話し続けない。1〜2文で十分。",
      ].join("\n");
    case "ENDING":
      return [
        "【ENDING — 会話終了】",
        "・女性は自然に会話を終えようとしています。",
        "・お礼や締めの言葉で終えてください。",
        "・新しい話題を出さない。",
      ].join("\n");
  }
}
