import { logOpenAIApiKeyStatusOnStartup } from "@/lib/env";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logOpenAIApiKeyStatusOnStartup();
  }
}
