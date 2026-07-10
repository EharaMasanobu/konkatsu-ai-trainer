import type { FemaleEmotionState } from "@engine/emotion/FemaleEmotionState";
import { FEMALE_EMOTION_LABELS } from "@engine/emotion/FemaleEmotionState";
import type { ConversationDifficulty } from "@engine/constants/conversationDifficulty";

const HIGH = 70;
const VERY_HIGH = 85;
const LOW = 35;

export function formatFemaleEmotionForPrompt(
  state: FemaleEmotionState,
  difficulty: ConversationDifficulty,
): string {
  const guidance = buildEmotionGuidance(state, difficulty);

  return [
    "以下はあなた（女性）の現在の感情状態です。数値をユーザーに見せてはいけません。",
    "感情に従って返答の長さ・温度感・質問の有無を変えてください。",
    "ただし会話の主導権は男性側です。感情が高くてもリードしすぎないでください。",
    "",
    `安心感（comfort）: ${state.comfort} / 100`,
    `興味（interest）: ${state.interest} / 100`,
    `緊張（tension）: ${state.tension} / 100`,
    `警戒（guard）: ${state.guard} / 100`,
    `疲れ（fatigue）: ${state.fatigue} / 100`,
    "",
    "【感情に基づく返答指針】",
    ...guidance.map((line) => `- ${line}`),
  ].join("\n");
}

function buildEmotionGuidance(
  state: FemaleEmotionState,
  difficulty: ConversationDifficulty,
): string[] {
  const lines: string[] = [];

  if (state.comfort >= VERY_HIGH && state.interest >= HIGH) {
    lines.push(
      "女性は楽しんでいます。笑顔が伝わる返答にしてください。",
      "返答はやや長め（難易度の上限内）でよい。",
      "少しだけ自分から質問しても構いません（質問率の上限内）。",
    );
  } else if (state.comfort >= HIGH) {
    lines.push("安心感が高い。自然な笑顔で、少し丁寧に答えてください。");
  } else if (state.comfort <= LOW) {
    lines.push("まだ安心できていません。短く控えめに答えてください。");
  }

  if (state.guard >= HIGH) {
    lines.push(
      "女性は警戒しています。返答は短めにしてください。",
      "敬語を意識し、質問はしないでください。",
    );
  } else if (state.guard >= 50) {
    lines.push("やや警戒している。距離感を保ち、踏み込みすぎない返答に。");
  }

  if (state.fatigue >= HIGH) {
    lines.push(
      "疲れがたまっています。リアクションを減らし、話題を広げないでください。",
    );
  } else if (state.fatigue >= 50) {
    lines.push("少し疲れている。返答は簡潔に。");
  }

  if (state.interest >= HIGH) {
    lines.push("興味がある。相手の話に少し乗り、返答を少し長めにしてよい。");
  } else if (state.interest <= LOW) {
    lines.push("興味が低い。淡いリアクションで、質問はしない。");
  }

  if (state.tension >= HIGH) {
    lines.push("緊張している。言葉選びは丁寧に、返答は短めに。");
  } else if (state.tension <= LOW) {
    lines.push("比較的リラックスしている。自然体で答えてよい。");
  }

  if (difficulty.id === "Hard") {
    lines.push("Hard難易度: 感情が高くても女性側から会話を広げない。");
  }

  if (lines.length === 0) {
    lines.push("普通の距離感。短めの返答を基本に、聞かれたことだけ答える。");
  }

  return lines;
}

export function formatFemaleEmotionForEvaluation(
  state?: FemaleEmotionState,
): Record<string, string> {
  if (!state) {
    return {
      female_emotion_comfort: "50",
      female_emotion_interest: "50",
      female_emotion_tension: "40",
      female_emotion_guard: "20",
      female_emotion_fatigue: "0",
      female_emotion_context: "（感情データなし）",
    };
  }

  const context = buildEvaluationEmotionContext(state);

  return {
    female_emotion_comfort: String(state.comfort),
    female_emotion_interest: String(state.interest),
    female_emotion_tension: String(state.tension),
    female_emotion_guard: String(state.guard),
    female_emotion_fatigue: String(state.fatigue),
    female_emotion_context: context,
  };
}

function buildEvaluationEmotionContext(state: FemaleEmotionState): string {
  const parts: string[] = [];

  if (state.comfort >= 85 && state.interest >= 80) {
    parts.push("会話終了時、女性は高い安心感と興味を持っている。「また会いたい」に近い心理。");
  }
  if (state.guard >= 70) {
    parts.push("警戒が高い。高得点は出にくい。男性に不信感や疲れを感じている可能性。");
  }
  if (state.fatigue >= 60) {
    parts.push("疲れが蓄積している。会話の負担を感じていた可能性。");
  }
  if (state.interest <= 35) {
    parts.push("興味が低い。再会意欲は低めと判断。");
  }

  if (parts.length === 0) {
    parts.push("感情は中程度。会話内容を優先して評価すること。");
  }

  return parts.join("\n");
}

export function formatEmotionLabelsForDebug(state: FemaleEmotionState): string {
  return (Object.keys(FEMALE_EMOTION_LABELS) as Array<keyof typeof FEMALE_EMOTION_LABELS>)
    .map((key) => `${FEMALE_EMOTION_LABELS[key]}: ${state[key]}`)
    .join(" / ");
}
