/**
 * 環境変数の取得（.env.local / Railway Variables 両対応）
 * Next.js は起動時に process.env へ注入するため、追加の読み込み処理は不要。
 */
export function getEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(
      `環境変数 ${name} が設定されていません。.env.local または Railway Variables を確認してください。`,
    );
  }
  return value;
}

export function getOpenAIApiKey(): string {
  return requireEnv("OPENAI_API_KEY");
}

export function isOpenAIConfigured(): boolean {
  return getEnv("OPENAI_API_KEY") !== undefined;
}

export function getDatabaseUrl(): string {
  return getEnv("DATABASE_URL") ?? "file:./prisma/dev.db";
}
