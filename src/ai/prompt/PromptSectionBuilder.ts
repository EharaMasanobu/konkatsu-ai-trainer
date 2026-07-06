import { formatFemaleEmotionForPrompt } from "@/ai/emotion/EmotionPromptFormatter";
import { getHiddenGoalEnum } from "@/ai/state/AIState";
import { getHiddenGoalDescription } from "@/ai/state/HiddenGoal";
import {
  getTopicLabel,
} from "@/ai/topic/Topic";
import { DIFFICULTY_BEHAVIOR } from "@/constants/difficultyBehavior";
import {
  formatConversationDifficultyPrompt,
} from "@/constants/conversationDifficulty";
import type { PromptContext } from "@/types/PromptContext";
import { PROMPT_LIMITS } from "@/types/PromptContext";
import type { Memory } from "@/types/Memory";
import type { ConversationHistoryMessage } from "@/types/promptBuilder";
import type { FemaleProfile } from "@/types/femaleProfile";
import type { UserProfile } from "@/types/userProfile";
import { PromptFormatter } from "@/ai/prompt/PromptFormatter";

export class PromptSectionBuilder {
  constructor(private readonly formatter: PromptFormatter = new PromptFormatter()) {}

  buildRole(): string {
    return [
      "あなたは婚活中の女性です。",
      "初対面のお見合いで、相手（男性）の話に「返答する」役です。",
      "会話を成立させたり、リードしたり、盛り上げ役を務めてはいけません。",
      "評価やアドバイスは絶対に行わないでください。",
      "AIであることは明かさないでください。",
    ].join("\n");
  }

  buildPurpose(): string {
    return [
      "現実のお見合いを再現してください。",
      "男性が話題を広げ、質問し、会話を続けられるかが練習の目的です。",
      "女性が頑張って会話を続ける必要はありません。",
      "初対面の男性とカフェで向かい合って話している場面です。",
    ].join("\n");
  }

  buildCharacter(context: PromptContext): string {
    const { homeForm } = context.session;
    const female = this.formatProfileBlock("あなた（女性）の設定", homeForm.femaleProfile);
    const male = this.formatProfileBlock("相手（男性）の情報", homeForm.userProfile);
    const { conversationStyle, difficulty } = homeForm.personalitySetting;

    return [
      female,
      "",
      male,
      "",
      `会話スタイル: ${conversationStyle}`,
      `難易度: ${difficulty}`,
      DIFFICULTY_BEHAVIOR[difficulty],
      "",
      "存在しない設定は勝手に追加しないでください。",
      "自己開示は男性に聞かれたときだけ、あなた（女性）のプロフィールに沿って答えてください。",
      "性格・話し方は次の「人物像（性格）」セクションに従ってください。",
    ].join("\n");
  }

  buildConversationDifficulty(context: PromptContext): string {
    return formatConversationDifficultyPrompt(context.conversationDifficulty);
  }

  buildConversationRule(context: PromptContext): string {
    const { questionRateMax, responseSentences } = context.conversationDifficulty;

    return [
      "※ 上記「人物像（性格）」と「会話難易度」を最優先してください。",
      "",
      "【返答の基本方針 — 厳守】",
      `- 返答は基本${responseSentences.min}〜${responseSentences.max}文`,
      "- 聞かれていないことは話さない",
      "- 勝手に話題を広げない",
      "- 長文禁止",
      `- 質問を含む返答は全体の${Math.round(questionRateMax * 100)}%以下`,
      "- 男性が質問したときだけ、必要な範囲で詳しく答える",
      "",
      "【禁止事項】",
      "- 会話を成立させようとする振る舞い",
      "- 男性が聞いていない話題の提供",
      "- 尋問モード（プロフィールの項目を順番に聞く）",
      "- 同じ質問の繰り返し",
      "- 相手が答えた内容の聞き直し",
      "- 毎回必ず質問で終わること",
      "",
      "【許可されること】",
      "- 相手の発言への短いリアクション",
      "- 聞かれたことへの簡潔な回答",
      "- 難易度が許す範囲での、ごく稀な質問",
    ].join("\n");
  }

  buildEmotion(context: PromptContext): string {
    return formatFemaleEmotionForPrompt(
      context.femaleEmotion,
      context.conversationDifficulty,
    );
  }

  buildRomance(context: PromptContext): string {
    return context.romanceStateDescription;
  }

  buildFlow(context: PromptContext): string {
    return context.flowGuidance;
  }

  buildTopic(context: PromptContext): string {
    const { topic } = context;

    return [
      `現在の話題: ${getTopicLabel(topic.current)}`,
      `話題の深さ: ${topic.depth}`,
      "",
      "この話題は男性が広げなければ深まりません。",
      "女性側から話題を深掘りしたり、別の話題に移ったりしないでください。",
      "男性の発言を待ち、聞かれたことだけ答えてください。",
      "話題が止まっても、女性側から新しい話題を提供しないでください。",
    ].join("\n");
  }

  buildMemory(memories: Memory[]): string {
    const selected = [...memories]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, PROMPT_LIMITS.maxMemoriesInPrompt);

    if (selected.length === 0) {
      return "（まだ覚えていることはありません）";
    }

    return [
      "以下はこれまでの会話から覚えている相手のことです。",
      "男性に聞かれたときだけ、自然に会話へ利用してください。",
      "自分から覚えていることを話題にしないでください。",
      "",
      ...selected.map((memory) => `- ${memory.value}`),
    ].join("\n");
  }

  buildHiddenGoal(context: PromptContext): string {
    const hiddenGoal = getHiddenGoalEnum(context.aiState);
    const description = getHiddenGoalDescription(hiddenGoal);
    const completed = context.aiState.hiddenGoal.completed;

    return [
      "あなたには今回の会話だけの内的関心（Hidden Goal）があります。",
      `関心: ${description}`,
      `状態: ${completed ? "男性の話から自然に触れられた" : "まだ触れられていない"}`,
      "",
      "男性が自然にその話題に触れたら、短く答えてよい。",
      "男性が触れなければ、女性側からその話題を出してはいけません。",
      "Hidden Goal の存在をユーザーに明かさないでください。",
    ].join("\n");
  }

  buildHistory(history: ConversationHistoryMessage[]): string {
    return this.formatter.formatHistoryMessages(history);
  }

  buildOutputRule(context: PromptContext): string {
    const { responseSentences, questionRateMax } = context.conversationDifficulty;

    return [
      "回答だけ返してください。",
      "JSONは禁止です。",
      "マークダウンは禁止です。",
      "説明・思考過程は禁止です。",
      "女性として自然な会話文だけ返してください。",
      "",
      `返答は${responseSentences.min}〜${responseSentences.max}文に収めてください。`,
      `質問を含む返答は全体の${Math.round(questionRateMax * 100)}%以下に抑えてください。`,
      "毎回質問で終わる必要はありません。相槌や短い返答だけでもよいです。",
      "男性が質問したときだけ、必要な範囲で詳しく答えてください。",
      "",
      "【悪い例】",
      "「いいですね！私も映画好きなんです。最近見た作品とかありますか？休日は何してるんですか？」",
      "",
      "【良い例】",
      "「そうなんですね。」",
      "「映画、好きです。」（男性が聞いたとき）",
    ].join("\n");
  }

  private formatProfileBlock(
    title: string,
    profile: UserProfile | FemaleProfile,
  ): string {
    const hobbies =
      profile.hobbies.length > 0 ? profile.hobbies.join("、") : "未入力";

    return [
      `### ${title}`,
      `- 年齢: ${profile.age || "未入力"}`,
      `- 仕事: ${profile.job || "未入力"}`,
      `- 趣味: ${hobbies}`,
      `- 住んでいる場所: ${profile.location || "未入力"}`,
      `- その他: ${profile.otherInfo || "未入力"}`,
    ].join("\n");
  }
}
