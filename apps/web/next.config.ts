import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@konkatsu/shared-types",
    "@konkatsu/conversation-engine",
    "@konkatsu/conversation-ui",
  ],
  poweredByHeader: false,
};

export default nextConfig;
