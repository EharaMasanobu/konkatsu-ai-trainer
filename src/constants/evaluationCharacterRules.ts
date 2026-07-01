import { HiddenGoal } from "@/ai/state/HiddenGoal";
import type {
  ConversationStyleType,
  PersonalityType,
} from "@/constants/homeOptions";

export interface PersonalityEvaluationRule {
  expectations: readonly string[];
  deductionExamples: readonly string[];
}

/** 性格別の評価基準（Character Aware Evaluation） */
export const PERSONALITY_EVALUATION_RULES: Record<
  PersonalityType,
  PersonalityEvaluationRule
> = {
  明るい: {
    expectations: [
      "リアクションが大きく、テンポよく返す",
      "質問で会話を広げようとする",
      "笑いやポジティブな言葉が自然にある",
      "相手の話への興味が伝わる",
      "会話が淡白にならない",
    ],
    deductionExamples: [
      "リアクションが薄い → empathy / naturalness から減点",
      "質問しない・会話を広げない → question / depth から減点",
      "会話が淡白・短文ばかり → naturalness / konkatsuFit から減点",
    ],
  },
  おとなしい: {
    expectations: [
      "安心感を与える優しい返答",
      "急かさず、相手のペースに合わせる",
      "聞き役として適度に寄り添う",
      "距離感を大切にする",
      "人見知りの相手を焦らせない",
    ],
    deductionExamples: [
      "質問攻め・連続質問 → question / naturalness から減点",
      "テンションが高すぎる・オーバーリアクション → naturalness / empathy から減点",
      "距離感が近すぎる・踏み込みすぎ → konkatsuFit から減点",
      "急に恋愛観やプライベートを深く聞く → depth / konkatsuFit から減点",
    ],
  },
  大人: {
    expectations: [
      "落ち着いた知的な会話",
      "品のある言葉遣いと適度な距離感",
      "的を射た質問と深い共感",
      "無理に盛り上げない自然なテンポ",
    ],
    deductionExamples: [
      "軽すぎる返答・子どもっぽいテンション → naturalness / konkatsuFit から減点",
      "大げさなリアクション → empathy / naturalness から減点",
      "話題変更が多い・浅い会話 → depth から減点",
    ],
  },
  活発: {
    expectations: [
      "エネルギッシュなリアクション",
      "会話を楽しもうとする姿勢",
      "質問と自己開示のバランス",
      "相手の話に乗るテンポ",
    ],
    deductionExamples: [
      "リアクションが弱い・会話が盛り上がらない → empathy / naturalness から減点",
      "質問が少なく一方通行 → question から減点",
      "自分の話ばかりで相手を置き去り → selfDisclosure / empathy から減点",
    ],
  },
  クール: {
    expectations: [
      "知的で落ち着いた返答",
      "無理に盛り上げない自然な会話",
      "必要な質問だけ、論理的な流れ",
      "空気を読んだ距離感",
    ],
    deductionExamples: [
      "オーバーリアクション・軽すぎる返答 → naturalness / empathy から減点",
      "空気を読まない・馴れ馴れしい → konkatsuFit から減点",
      "テンションが高すぎる → naturalness から減点",
    ],
  },
  天然: {
    expectations: [
      "話を楽しむ柔らかいリアクション",
      "相手を否定せず受け止める",
      "素直で温かい共感",
      "話題の飛びを許容しつつ会話を続ける",
    ],
    deductionExamples: [
      "細かく訂正する・真面目すぎる → empathy / naturalness から減点",
      "話を切る・否定する → empathy / depth から減点",
      "堅苦しい尋問調 → question / naturalness から減点",
    ],
  },
};

/** 会話スタイル別の補正（ホーム画面の選択肢に対応） */
export const CONVERSATION_STYLE_EVALUATION_RULES: Record<
  ConversationStyleType,
  { label: string; expectations: readonly string[]; deductionExamples: readonly string[] }
> = {
  よく話す: {
    label: "積極的（よく話す女性）",
    expectations: [
      "相手も自分の話をしてくれることを期待している",
      "受け身すぎると会話が続かない",
    ],
    deductionExamples: [
      "受け身すぎる・質問が少なすぎる → question / selfDisclosure から減点",
      "相槌だけで自分の話がない → selfDisclosure から減点",
    ],
  },
  聞き上手: {
    label: "聞き上手（聞くタイプの女性）",
    expectations: [
      "相手の話を聞きたいが、男性の自己開示も欲しい",
      "一方的な聞き役は歓迎されない",
    ],
    deductionExamples: [
      "質問攻め・尋問っぽい → question / naturalness から減点",
      "自分の話ばかりで相手を聞かない → empathy / question から減点",
    ],
  },
  バランス型: {
    label: "慎重（バランス型）",
    expectations: [
      "適度な距離感とバランスの取れた会話",
      "急な深掘りや踏み込みは警戒される",
    ],
    deductionExamples: [
      "踏み込みすぎる質問・急な恋愛観 → depth / konkatsuFit から減点",
      "話題変更が多い → depth / naturalness から減点",
    ],
  },
};

/** Hidden Goal 別の減点基準 */
export const HIDDEN_GOAL_EVALUATION_RULES: Record<HiddenGoal, string> = {
  [HiddenGoal.VALUE]:
    "価値観に触れられない・大切にしていることを聞けていない → depth / konkatsuFit から減点",
  [HiddenGoal.HOBBY]:
    "趣味を深掘りできない・興味を示せていない → depth / question から減点",
  [HiddenGoal.JOB]:
    "仕事の話を深掘りできない・やりがいに触れられない → depth から減点",
  [HiddenGoal.HOLIDAY]:
    "休日の過ごし方について自然に聞けていない → depth / question から減点",
  [HiddenGoal.MARRIAGE]:
    "結婚観に触れられない、または初対面で唐突すぎる → depth / konkatsuFit から減点",
  [HiddenGoal.FAMILY]:
    "家族観について自然に話題にできていない → depth から減点",
  [HiddenGoal.FOOD]:
    "食の好み・食事の話に触れられない → depth / question から減点",
  [HiddenGoal.TRAVEL]:
    "旅行の話を深掘りできない → depth / question から減点",
  [HiddenGoal.FUTURE]:
    "将来の展望について自然に聞けていない → depth から減点",
  [HiddenGoal.LOVE]:
    "恋愛観に触れられない、または初対面で唐突すぎる → depth / konkatsuFit から減点",
};
