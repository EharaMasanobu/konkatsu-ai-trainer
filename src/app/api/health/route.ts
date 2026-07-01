import { NextResponse } from "next/server";

import { getDatabaseUrl, isOpenAIConfigured } from "@/lib/env";

export async function GET() {
  const openaiConfigured = isOpenAIConfigured();

  const body = {
    status: openaiConfigured ? "ok" : "degraded",
    checks: {
      openai: openaiConfigured ? "configured" : "missing_openai_api_key",
      databaseUrl: Boolean(getDatabaseUrl()),
      nodeEnv: process.env.NODE_ENV ?? "unknown",
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: openaiConfigured ? 200 : 503,
  });
}
