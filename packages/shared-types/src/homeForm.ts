import type { ConversationSetting } from "./conversationSetting";
import type { FemaleProfile } from "./femaleProfile";
import type { PersonalitySetting } from "./personalitySetting";
import type { UserProfile } from "./userProfile";

export interface HomeForm {
  userProfile: UserProfile;
  femaleProfile: FemaleProfile;
  personalitySetting: PersonalitySetting;
  conversationSetting: ConversationSetting;
}
