import { NextResponse } from "next/server";

import { APP_VERSION } from "@/lib/appMeta";
import { isOpenAIConfigured } from "@/lib/env";

export interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
  environment: string;
  openaiConfigured: boolean;
}

/**
 * Railway 等の liveness プローブ用。
 * 常に HTTP 200 を返す（OPENAI_API_KEY の有無は問わない）。
 */
export async function GET() {
  const body: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    environment: process.env.NODE_ENV ?? "unknown",
    openaiConfigured: isOpenAIConfigured(),
  };

  return NextResponse.json(body, { status: 200 });
}
