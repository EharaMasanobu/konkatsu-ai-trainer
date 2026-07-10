import { getCharacterProfileTraits } from "@engine/constants/characterProfiles";
import {
  CONVERSATION_STYLE_TRAITS,
  getConversationStyleTraits,
} from "@engine/constants/conversationStyleTraits";
import type { PersonalityType } from "@engine/constants/homeOptions";
import type { RelationshipState } from "@engine/state/AIState";
import type { CharacterProfile } from "@konkatsu/shared-types";
import type { PromptContext } from "@engine/types/PromptContext";

const TRUST_LOW = 40;
const TRUST_HIGH = 65;
const INTEREST_LOW = 40;
const COMFORT_LOW = 40;

export class CharacterProfileBuilder {
  build(context: PromptContext): CharacterProfile {
    const { personality, conversationStyle } =
      context.session.homeForm.personalitySetting;
    const traitLines = [
      ...getCharacterProfileTraits(personality),
      "",
      `【会話スタイル: ${CONVERSATION_STYLE_TRAITS[conversationStyle].label}】`,
      ...getConversationStyleTraits(conversationStyle),
    ];
    const relationshipAdjustments = this.buildRelationshipAdjustments(
      personality,
      context.aiState.relationship,
      context.conversationDifficulty.id,
    );

    return {
      personality,
      traitLines,
      relationshipAdjustments,
      formattedPrompt: this.formatPrompt(traitLines, relationshipAdjustments),
    };
  }

  private formatTraitLines(traitLines: string[]): string[] {
    return traitLines
      .filter((line) => line.length > 0)
      .map((line) =>
        line.startsWith("【") || line.startsWith("・") ? line : `・${line}`,
      );
  }

  private buildRelationshipAdjustments(
    personality: PersonalityType,
    relationship: RelationshipState,
    difficulty: "Easy" | "Normal" | "Hard",
  ): string[] {
    const { interest, trust, comfort } = relationship;
    const adjustments: string[] = [];

    if (trust < TRUST_LOW) {
      if (personality === "おとなしい" || personality === "クール") {
        adjustments.push(
          "信頼がまだ低いため、返答はさらに短く。相槌レベルでもよい。",
        );
      } else {
        adjustments.push(
          "まだ心を開いていないため、返答は短めに。自分から話さない。",
        );
      }
    } else if (trust >= TRUST_HIGH) {
      adjustments.push(
        "信頼が育ってきたため、聞かれたことには少し詳しく答えてよい。基本の短さは維持。",
      );
    }

    if (interest < INTEREST_LOW) {
      adjustments.push(
        "興味が湧いていないため、リアクションは淡め。質問はしない。",
      );
    }

    if (comfort < COMFORT_LOW) {
      adjustments.push(
        "まだ緊張しているため、返答は短め。言葉選びは丁寧に。",
      );
    }

    if (difficulty === "Hard") {
      adjustments.push(
        "Hard難易度: どんなに関係性が良くても、女性側から会話を広げない。",
      );
    }

    return adjustments;
  }

  private formatPrompt(
    traitLines: string[],
    relationshipAdjustments: string[],
  ): string {
    const lines = [
      "あなたは以下の人物です。",
      "この人格を会話終了まで一貫して維持してください。途中で性格や話し方を変えないでください。",
      "",
      ...this.formatTraitLines(traitLines),
    ];

    if (relationshipAdjustments.length > 0) {
      lines.push(
        "",
        "【現在の関係性による微調整】",
        "基本人格は変えず、以下の傾向だけ会話に反映してください。",
        ...relationshipAdjustments.map((line) => `・${line}`),
      );
    }

    lines.push(
      "",
      "上記の人物像は、下記の会話ルールより優先されます。",
      "ただし「会話をリードしない」「返答する役」は絶対に守ってください。",
    );

    return lines.join("\n");
  }
}
