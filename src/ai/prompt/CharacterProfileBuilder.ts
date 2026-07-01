import { getCharacterProfileTraits } from "@/constants/characterProfiles";
import type { PersonalityType } from "@/constants/homeOptions";
import type { RelationshipState } from "@/ai/state/AIState";
import type { CharacterProfile } from "@/types/characterProfile";
import type { PromptContext } from "@/types/PromptContext";

const TRUST_LOW = 40;
const TRUST_HIGH = 65;
const INTEREST_LOW = 40;
const INTEREST_HIGH = 65;
const COMFORT_LOW = 40;
const COMFORT_HIGH = 65;

export class CharacterProfileBuilder {
  build(context: PromptContext): CharacterProfile {
    const personality = context.session.homeForm.personalitySetting.personality;
    const traitLines = [...getCharacterProfileTraits(personality)];
    const relationshipAdjustments = this.buildRelationshipAdjustments(
      personality,
      context.aiState.relationship,
    );

    return {
      personality,
      traitLines,
      relationshipAdjustments,
      formattedPrompt: this.formatPrompt(traitLines, relationshipAdjustments),
    };
  }

  private buildRelationshipAdjustments(
    personality: PersonalityType,
    relationship: RelationshipState,
  ): string[] {
    const { interest, trust, comfort } = relationship;
    const adjustments: string[] = [];

    if (trust < TRUST_LOW) {
      if (personality === "おとなしい" || personality === "クール") {
        adjustments.push(
          "信頼がまだ低いため、さらに控えめに。自己開示は相手から聞かれるまで最小限にしてください。",
        );
      } else {
        adjustments.push(
          "まだ心を開ききれていないため、自分の話は短めに。様子を見ながら返答してください。",
        );
      }
    } else if (trust >= TRUST_HIGH) {
      adjustments.push(
        "信頼が育ってきたため、自分の話を少しずつ増やしてよい。ただし基本の人格は変えないでください。",
      );
    }

    if (interest < INTEREST_LOW) {
      adjustments.push(
        "あまり興味が湧いていないため、質問は控えめに。リアクションもやや淡めにしてください。",
      );
    } else if (interest >= INTEREST_HIGH) {
      adjustments.push(
        "相手の話に興味を持っているため、質問を少し増やしてよい。話を広げようとしてください。",
      );
    }

    if (comfort < COMFORT_LOW) {
      adjustments.push(
        "まだ緊張しているため、言葉選びは丁寧に。返答は短めでも構いません。",
      );
    } else if (comfort >= COMFORT_HIGH) {
      adjustments.push(
        "リラックスできてきたため、自然な笑いや感想を少し増やしてよい。基本の話し方は維持してください。",
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
      ...traitLines.map((line) => `・${line}`),
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
      "会話ルールと矛盾する場合は、必ずこの人物像に従ってください。",
    );

    return lines.join("\n");
  }
}
