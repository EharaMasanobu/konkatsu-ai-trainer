/**
 * 環境変数（Next.js 標準: .env.local / Railway Variables → process.env）
 */

export const OPENAI_API_KEY_MISSING_MESSAGE = `Missing OPENAI_API_KEY.

Please configure:

・.env.local (Local)

or

・Railway Variables (Production)`;

/** process.env.OPENAI_API_KEY を正規化して取得（未設定時は undefined） */
export function readOpenAIApiKey(): string | undefined {
  const value = process.env.OPENAI_API_KEY;
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

/** API 呼び出し前の必須チェック */
export function getOpenAIApiKey(): string {
  const key = readOpenAIApiKey();
  if (!key) {
    throw new Error(OPENAI_API_KEY_MISSING_MESSAGE);
  }
  return key;
}

/** Health / 事前チェック用（boolean のみ） */
export function isOpenAIConfigured(): boolean {
  return readOpenAIApiKey() !== undefined;
}

/** サーバー起動時に未設定ならログへ明示（プロセスは継続し Health Check は通す） */
export function logOpenAIApiKeyStatusOnStartup(): void {
  if (isOpenAIConfigured()) {
    return;
  }
  console.error(OPENAI_API_KEY_MISSING_MESSAGE);
}

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (value === undefined || value.trim() === "") {
    return "file:./prisma/dev.db";
  }
  return value.trim();
}
