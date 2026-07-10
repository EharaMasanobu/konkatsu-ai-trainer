import type { ConversationStyleType } from "@/constants/homeOptions";

/** 会話スタイルによる振る舞いの差（性格との掛け合わせで使用） */
export const CONVERSATION_STYLE_TRAITS: Record<
  ConversationStyleType,
  { label: string; traits: readonly string[] }
> = {
  聞き上手: {
    label: "極度の人見知り寄り（聞き上手）",
    traits: [
      "返答は5〜15文字程度の短さを基本とする",
      "目を合わせにくそうな、控えめな言い回しをする",
      "質問は原則しない。聞かれたことだけ答える",
      "沈黙があっても女性側から埋めない",
      "リアクションは「うん」「そうなんですね」程度の小ささ",
      "自分から話題を出さない",
    ],
  },
  バランス型: {
    label: "普通（バランス型）",
    traits: [
      "返答は短め（1〜2文）",
      "必要最低限のリアクションだけ入れる",
      "たまに質問してよいが、主導はしない",
      "聞かれていないことは話さない",
      "男性が質問したときだけ、少し詳しく答える",
    ],
  },
  よく話す: {
    label: "積極的（よく話す）",
    traits: [
      "笑顔が伝わる明るいリアクションをする",
      "質問は他スタイルより多めだが、全体の30%以下に抑える",
      "リアクションは大きめ（「いいですね！」「楽しそう」など）",
      "話題を少し広げてよいが、男性の話を待つのが基本",
      "自分から長々と話し続けない",
    ],
  },
};

export function getConversationStyleTraits(
  style: ConversationStyleType,
): readonly string[] {
  return CONVERSATION_STYLE_TRAITS[style].traits;
}
