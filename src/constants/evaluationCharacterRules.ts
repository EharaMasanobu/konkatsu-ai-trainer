import { HiddenGoal } from "@/ai/state/HiddenGoal";
import type {
  ConversationStyleType,
  PersonalityType,
} from "@/constants/homeOptions";

export interface PersonalityEvaluationRule {
  expectations: readonly string[];
  deductionExamples: readonly string[];
}

/** 性格別の評価基準（Character Aware Evaluation）— Version3 女性視点 */
export const PERSONALITY_EVALUATION_RULES: Record<
  PersonalityType,
  PersonalityEvaluationRule
> = {
  明るい: {
    expectations: [
      "男性が話題を広げ、会話のテンポを作れること",
      "明るい女性に合った自然な距離感",
      "女性が短く返しても会話が止まらない質問力",
    ],
    deductionExamples: [
      "相槌だけで会話が止まる → easeOfTalking / questionSkill から減点",
      "女性の短い返答に乗れない → naturalness から減点",
      "踏み込みすぎ・馴れ馴れしい → nonPushiness から減点",
    ],
  },
  おとなしい: {
    expectations: [
      "人見知りの女性が安心できる穏やかな話し方",
      "急かさず、相手のペースに合わせる",
      "質問攻めにしない",
    ],
    deductionExamples: [
      "質問攻め・連続質問 → easeOfTalking / nonPushiness から減点",
      "テンションが高すぎる → senseOfSecurity / naturalness から減点",
      "距離が近すぎる → nonPushiness から減点",
    ],
  },
  大人: {
    expectations: [
      "落ち着いた知的な会話のキャッチボール",
      "品のある言葉遣いと適度な距離感",
      "男性主導で話題が自然に広がること",
    ],
    deductionExamples: [
      "軽すぎる返答・子どもっぽいテンション → naturalness から減点",
      "話題が浅いまま終わる → questionSkill から減点",
      "大げさなリアクション → empathy / naturalness から減点",
    ],
  },
  活発: {
    expectations: [
      "男性が会話のリードを取れること",
      "女性の短い返答でも話題を広げられる質問力",
      "一方的にならないバランス",
    ],
    deductionExamples: [
      "会話が盛り上がらない・止まる → questionSkill / easeOfTalking から減点",
      "自分の話ばかり → nonPushiness / empathy から減点",
      "女性に会話を任せきり → easeOfTalking から減点",
    ],
  },
  クール: {
    expectations: [
      "知的で落ち着いた返答",
      "無理に盛り上げない自然な会話",
      "空気を読んだ距離感",
    ],
    deductionExamples: [
      "オーバーリアクション → naturalness / empathy から減点",
      "空気を読まない → nonPushiness から減点",
      "話題を広げられない → questionSkill から減点",
    ],
  },
  天然: {
    expectations: [
      "柔らかい共感と自然な会話",
      "女性の素直な返答に適切に乗る",
      "否定せず受け止める",
    ],
    deductionExamples: [
      "細かく訂正する・真面目すぎる → empathy / easeOfTalking から減点",
      "話を切る・否定する → empathy から減点",
      "堅苦しい尋問調 → questionSkill / nonPushiness から減点",
    ],
  },
};

/** 会話スタイル別の補正 */
export const CONVERSATION_STYLE_EVALUATION_RULES: Record<
  ConversationStyleType,
  { label: string; expectations: readonly string[]; deductionExamples: readonly string[] }
> = {
  よく話す: {
    label: "積極的（よく話す女性）",
    expectations: [
      "女性は自分から話すが、男性が会話をリードすることを期待",
      "男性の質問と話題提供がなければ会話が続かない",
    ],
    deductionExamples: [
      "受け身すぎて会話が止まる → questionSkill / easeOfTalking から減点",
      "女性の短い返答に次の話題を出せない → questionSkill から減点",
    ],
  },
  聞き上手: {
    label: "極度の人見知り（聞き上手）",
    expectations: [
      "ほぼ返答だけの女性に対し、男性が質問と話題で会話を作る",
      "質問攻めは逆効果",
    ],
    deductionExamples: [
      "質問攻め・尋問っぽい → easeOfTalking / nonPushiness から減点",
      "会話が止まったまま → questionSkill から減点",
      "女性に話題提供を求めるような受け身 → easeOfTalking から減点",
    ],
  },
  バランス型: {
    label: "普通（バランス型）",
    expectations: [
      "適度な距離感とバランスの取れた会話",
      "男性が話題を広げるリード力",
    ],
    deductionExamples: [
      "踏み込みすぎる質問 → nonPushiness から減点",
      "話題が続かない → questionSkill / naturalness から減点",
    ],
  },
};

/** Hidden Goal 別の減点基準 */
export const HIDDEN_GOAL_EVALUATION_RULES: Record<HiddenGoal, string> = {
  [HiddenGoal.VALUE]:
    "価値観に自然に触れられない → questionSkill / wouldMeetAgain から減点",
  [HiddenGoal.HOBBY]:
    "趣味の話題を男性から広げられない → questionSkill から減点",
  [HiddenGoal.JOB]:
    "仕事の話を深掘りできない → questionSkill から減点",
  [HiddenGoal.HOLIDAY]:
    "休日の話題を自然に広げられない → questionSkill から減点",
  [HiddenGoal.MARRIAGE]:
    "結婚観に触れられない、または唐突すぎる → nonPushiness / wouldMeetAgain から減点",
  [HiddenGoal.FAMILY]:
    "家族観について自然に話題にできない → questionSkill から減点",
  [HiddenGoal.FOOD]:
    "食の話に触れられない → questionSkill から減点",
  [HiddenGoal.TRAVEL]:
    "旅行の話を広げられない → questionSkill から減点",
  [HiddenGoal.FUTURE]:
    "将来の展望について自然に聞けない → questionSkill から減点",
  [HiddenGoal.LOVE]:
    "恋愛観に触れられない、または唐突すぎる → nonPushiness から減点",
};
