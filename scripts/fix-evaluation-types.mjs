import fs from "node:fs";

let content = fs.readFileSync("src/types/Evaluation.ts", "utf8");

content = content
  .replace(
    /import type \{ AIState \} from "@\/ai\/state\/AIState";\r?\n/,
    "",
  )
  .replace(
    /import type \{ FemaleEmotionState \} from "@\/ai\/emotion\/FemaleEmotionState";/,
    'import type { FemaleEmotionState } from "./engine/emotion";',
  )
  .replace(
    /import type \{ RomanceResult \} from "@\/ai\/romance\/RomanceState";/,
    'import type { RomanceResult } from "./engine/romance";',
  )
  .replace(
    /import type \{ DifficultyType \} from "@\/constants\/homeOptions";/,
    'import type { DifficultyType } from "./personalitySetting";',
  )
  .replace(
    /import type \{ ConversationHistoryMessage \} from "@\/types\/promptBuilder";/,
    'import type { ConversationHistoryMessage } from "./conversation";',
  )
  .replace(
    /import type \{ Session \} from "@\/types\/session";/,
    'import type { Session } from "./session";',
  )
  .replace(/  aiState\?: AIState;/, "  aiState?: unknown;")
  .replace(/\/\*\* Version3:.*?\*\/\r?\n/g, "")
  .replace(/  \/\*\*[^*]*\*\/\r?\n/g, "");

fs.writeFileSync("packages/shared-types/src/Evaluation.ts", content, "utf8");
console.log("Evaluation.ts fixed");
