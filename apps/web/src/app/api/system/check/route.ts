import { NextResponse } from "next/server";

import { APP_VERSION } from "@/lib/appMeta";
import { getDatabaseUrl, isOpenAIConfigured } from "@/lib/env";

export interface SystemCheckResponse {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    openai: "configured" | "missing_openai_api_key";
    databaseUrl: boolean;
  };
}

/**
 * 運用・デバッグ向けの詳細チェック。
 * OPENAI_API_KEY 未設定時は HTTP 503 を返す。
 */
export async function GET() {
  const openaiConfigured = isOpenAIConfigured();

  const body: SystemCheckResponse = {
    status: openaiConfigured ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    environment: process.env.NODE_ENV ?? "unknown",
    checks: {
      openai: openaiConfigured ? "configured" : "missing_openai_api_key",
      databaseUrl: Boolean(getDatabaseUrl()),
    },
  };

  return NextResponse.json(body, {
    status: openaiConfigured ? 200 : 503,
  });
}
