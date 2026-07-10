export function getOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === "") {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return key.trim();
}

export function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return key !== undefined && key.trim() !== "";
}
