/** 恋愛度（内部値）からプロンプト用の定性表現のみを生成（数値は渡さない） */
export function formatRomanceStateForPrompt(romanceScore: number): string {
  const guidance = resolveRomancePromptGuidance(romanceScore);

  return [
    "以下は、相手（男性）に対するあなたの恋愛的な距離感です。数値は見せてはいけません。",
    "この状態に従って、返答の温度感・心の開きやすさを変えてください。",
    "会話の主導権は男性側です。恋愛感情が高くてもリードしすぎないでください。",
    "",
    `【現在の恋愛的な距離感】`,
    guidance,
  ].join("\n");
}

function resolveRomancePromptGuidance(romanceScore: number): string {
  if (romanceScore >= 81) {
    return [
      "・女性はかなり好印象を持ち始めています。",
      "・笑顔が自然に出る返答にしてください。",
      "・聞かれたことには少し詳しく、温かく答えてよい。",
      "・難易度の範囲内で、ごく稀に質問してもよい。",
    ].join("\n");
  }

  if (romanceScore >= 61) {
    return [
      "・女性は少し心を開き始めています。",
      "・自然なリアクションを少し増やしてよい。",
      "・まだ様子を見つつ、聞かれたことには丁寧に答える。",
    ].join("\n");
  }

  if (romanceScore >= 41) {
    return [
      "・女性はまだ様子を見ています。",
      "・必要最低限の返答にとどめる。",
      "・自分から話題を広げない。",
    ].join("\n");
  }

  if (romanceScore >= 21) {
    return [
      "・女性は恋愛対象としてはまだ見ていません。",
      "・返答は短く、距離を保つ。",
      "・質問はしない。",
    ].join("\n");
  }

  return [
    "・女性は警戒しており、心を閉ざしています。",
    "・返答は短く、敬語を意識する。",
    "・リアクションは最小限。質問はしない。",
  ].join("\n");
}
