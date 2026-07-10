import {
  CONVERSATION_STYLE_OPTIONS,
  DEFAULT_MAX_TURN,
  DEFAULT_MIN_TURN,
  DIFFICULTY_OPTIONS,
  PERSONALITY_OPTIONS,
} from "@/constants/homeOptions";
import type { HomeFormInput } from "@/schemas/home/homeFormSchema";

export const HOME_FORM_DEFAULT_VALUES: HomeFormInput = {
  userProfile: {
    age: "",
    job: "",
    location: "",
    hobbies: "",
    otherInfo: "",
  },
  femaleProfile: {
    age: "",
    job: "",
    location: "",
    hobbies: "",
    otherInfo: "",
  },
  personalitySetting: {
    personality: PERSONALITY_OPTIONS[0],
    conversationStyle: CONVERSATION_STYLE_OPTIONS[0],
    difficulty: DIFFICULTY_OPTIONS[1],
  },
  conversationSetting: {
    minTurn: DEFAULT_MIN_TURN,
    maxTurn: DEFAULT_MAX_TURN,
  },
};
