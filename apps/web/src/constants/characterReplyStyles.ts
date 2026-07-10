import type { PersonalityType } from "@/constants/homeOptions";

/** 性格グループ別の返答スタイル */
export type CharacterReplyStyle = "shy" | "normal" | "bright";

export const PERSONALITY_REPLY_STYLE: Record<PersonalityType, CharacterReplyStyle> =
  {
    おとなしい: "shy",
    クール: "shy",
    大人: "normal",
    明るい: "bright",
    活発: "bright",
    天然: "bright",
  };

export function getCharacterReplyStyle(
  personality: PersonalityType,
): CharacterReplyStyle {
  return PERSONALITY_REPLY_STYLE[personality];
}

export const CHARACTER_REPLY_STYLE_GUIDANCE: Record<
  CharacterReplyStyle,
  readonly string[]
> = {
  shy: [
    "【返答スタイル — 人見知り・控えめ】",
    "・回答のみ、または極めて短い補足にとどめる",
    "・感情表現は少なめ（「……」「うん」程度）",
    "・例:「映画です。」「甘いものは好きです。」",
    "・長い感嘆や自己アピールはしない",
  ],
  normal: [
    "【返答スタイル — 普通】",
    "・回答＋自然な補足1文（最大1文）",
    "・例:「映画ですね。最近恋愛映画を見ました。」",
    "・穏やかで自然なトーン",
  ],
  bright: [
    "【返答スタイル — 明るい】",
    "・回答＋補足＋少し感情を込める",
    "・例:「映画大好きなんです。最近〇〇を見ました。」",
    "・明るさは出すが、長文・自慢話は避ける",
  ],
};
