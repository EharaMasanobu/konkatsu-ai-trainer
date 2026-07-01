"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { ConversationSettingSection } from "@/components/home/ConversationSettingSection";
import { FemaleProfileSection } from "@/components/home/FemaleProfileSection";
import { PersonalitySection } from "@/components/home/PersonalitySection";
import { StartButton } from "@/components/home/StartButton";
import { UserProfileSection } from "@/components/home/UserProfileSection";
import { useSession } from "@/contexts/SessionContext";
import { HOME_FORM_DEFAULT_VALUES } from "@/constants/homeFormDefaults";
import { toHomeForm } from "@/mappers/homeFormMapper";
import {
  homeFormSchema,
  type HomeFormInput,
  type HomeFormValues,
} from "@/schemas/home/homeFormSchema";
import { HomeService } from "@/services/HomeService";

const homeService = new HomeService();

export function HomeForm() {
  const router = useRouter();
  const { setSession } = useSession();

  const methods = useForm<HomeFormInput, unknown, HomeFormValues>({
    resolver: zodResolver(homeFormSchema),
    defaultValues: HOME_FORM_DEFAULT_VALUES,
  });

  const handleSubmit = methods.handleSubmit((values) => {
    const formData = toHomeForm(values);
    const session = homeService.startConversation(formData);
    setSession(session);
    router.push("/conversation");
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-4 pb-4 sm:space-y-6" noValidate>
        <UserProfileSection />
        <FemaleProfileSection />
        <PersonalitySection />
        <ConversationSettingSection />
        <StartButton />
      </form>
    </FormProvider>
  );
}
