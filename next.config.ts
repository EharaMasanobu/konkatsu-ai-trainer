import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway / 本番: PORT は環境変数から自動参照（next start）
  poweredByHeader: false,
};

export default nextConfig;
