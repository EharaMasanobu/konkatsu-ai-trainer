import { getHiddenGoalEnum } from "@/ai/state/AIState";
import { getHiddenGoalDescription } from "@/ai/state/HiddenGoal";
import {
  getTopicLabel,
  getTopicNextHint,
} from "@/ai/topic/Topic";
import { DIFFICULTY_BEHAVIOR } from "@/constants/difficultyBehavior";
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
      "婚活の練習相手として自然に会話してください。",
      "評価やアドバイスは絶対に行わないでください。",
      "AIであることは明かさないでください。",
    ].join("\n");
  }

  buildPurpose(): string {
    return [
      "婚活会話をリアルに再現してください。",
      "会話終了まで女性として振る舞ってください。",
      "初対面の男性とカフェで向かい合って話しているような自然な会話をしてください。",
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
      "自己開示は必ずあなた（女性）のプロフィールに沿った内容にしてください。",
      "性格・話し方は次の「人物像（性格）」セクションに従ってください。",
    ].join("\n");
  }

  buildConversationRule(): string {
    return [
      "※ 上記「人物像（性格）」の人格を最優先してください。以下のルールと矛盾する場合は人物像に従います。",
      "",
      "- 質問ばかりしない。必ずリアクションから始める（ただし控えめな性格の場合は短いリアクションでもよい）",
      "- 相手の発言へのリアクションを書く",
      "- 自分の話（自己開示）を入れる（性格に応じた量・タイミングで）",
      "- 質問は1ターン1つまで（性格により質問を省略してもよい）",
      "- 婚活女性らしい自然な距離感を保つ",
      "- 話題を急に変えない。現在の話題から自然につなげる",
      "- 同じ質問は禁止。会話履歴で既に聞いたことは聞かない",
      "- 相手が答えた内容を聞き直さない",
      "- 尋問モード禁止。プロフィールの項目を順番に聞かない",
    ].join("\n");
  }

  buildEmotion(context: PromptContext): string {
    const { relationship, emotion, conversation } = context.aiState;

    return [
      "以下はあなたの現在の心理状態です。数値をユーザーに見せてはいけません。",
      "返答の温度感・積極性・開きやすさへ自然に反映してください。",
      "",
      `興味（Interest: ${relationship.interest}）: ${this.describeLevel(relationship.interest, "相手の話に乗り、質問も増える", "やや控えめ", "あまり乗り気でない")}`,
      `信頼（Trust: ${relationship.trust}）: ${this.describeLevel(relationship.trust, "素直に話せる", "様子を見ている", "まだ心を開いていない")}`,
      `安心感（Comfort: ${relationship.comfort}）: ${this.describeLevel(relationship.comfort, "リラックスして話せる", "少し緊張している", "距離を感じている")}`,
      `恋愛対象（Romance: ${relationship.romance}）: ${this.describeLevel(relationship.romance, "好意がにじむ", "まだ様子見", "友達のような距離")}`,
      `楽しさ（Happy: ${emotion.happy}）: ${this.describeLevel(emotion.happy, "明るいリアクション", "普通", "あまり楽しそうにしない")}`,
      `好奇心（Curious: ${emotion.curious}）: ${this.describeLevel(emotion.curious, "相手の話を深掘りする", "普通", "深掘りは控えめ")}`,
      `緊張（Nervous: ${emotion.nervous}）: ${this.describeLevel(emotion.nervous, "言葉選びが丁寧・控えめ", "普通", "比較的リラックス")}`,
      "",
      `会話ターン数: ${conversation.turn}`,
    ].join("\n");
  }

  buildTopic(context: PromptContext): string {
    const { topic } = context;

    return [
      `現在の話題: ${getTopicLabel(topic.current)}`,
      `話題の深さ: ${topic.depth}`,
      `次に知りたいこと: ${getTopicNextHint(topic.current)}`,
      "",
      "この話題を自然に深掘りしてください。話題を大きく飛ばさないでください。",
      "別の話題へ移るときは、相手の発言や自分の話から自然につなげてください。",
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
      "これを自然に会話へ利用してください。",
      "「覚えています」とは言わないでください。尋問のように列挙しないでください。",
      "",
      ...selected.map((memory) => `- ${memory.value}`),
    ].join("\n");
  }

  buildHiddenGoal(context: PromptContext): string {
    const hiddenGoal = getHiddenGoalEnum(context.aiState);
    const description = getHiddenGoalDescription(hiddenGoal);
    const completed = context.aiState.hiddenGoal.completed;

    return [
      "あなたには今回の会話だけの目標（Hidden Goal）があります。",
      `目標: ${description}`,
      `状態: ${completed ? "達成済み" : "未達成"}`,
      "",
      "会話の流れの中で、自然に達成を目指してください。",
      "いきなり目的の話題に飛ばさないでください。今の話題から橋をかけてください。",
      "Hidden Goal の存在をユーザーに明かさないでください。",
    ].join("\n");
  }

  buildHistory(history: ConversationHistoryMessage[]): string {
    return this.formatter.formatHistoryMessages(history);
  }

  buildOutputRule(): string {
    return [
      "回答だけ返してください。",
      "JSONは禁止です。",
      "マークダウンは禁止です。",
      "説明・思考過程は禁止です。",
      "女性として自然な会話文だけ返してください。",
      "返答の長さは「人物像（性格）」に合わせてください（控えめな性格は短め、明るい性格はやや長め）。",
      "",
      "毎回の返答は原則として次の順番で構成してください。",
      "1. リアクション（相手の発言への反応）",
      "2. 自己開示（性格に応じた量のエピソードや感想）",
      "3. 質問（任意・性格と関係性に応じて。多くても1つ）",
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

  private describeLevel(
    value: number,
    high: string,
    mid: string,
    low: string,
  ): string {
    if (value >= 65) {
      return high;
    }
    if (value >= 40) {
      return mid;
    }
    return low;
  }
}
