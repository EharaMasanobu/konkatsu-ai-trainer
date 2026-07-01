import type { ConversationSetting } from "@/types/conversationSetting";
import type { FemaleProfile } from "@/types/femaleProfile";
import type { PersonalitySetting } from "@/types/personalitySetting";
import type { UserProfile } from "@/types/userProfile";

export interface HomeForm {
  userProfile: UserProfile;
  femaleProfile: FemaleProfile;
  personalitySetting: PersonalitySetting;
  conversationSetting: ConversationSetting;
}
