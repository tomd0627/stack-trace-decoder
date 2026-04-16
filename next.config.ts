import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Treat the Anthropic SDK as an external package so Next.js doesn't attempt
  // to bundle/trace it — it runs server-side only and has native deps.
  serverExternalPackages: ["@anthropic-ai/sdk"],

  async headers() {
    return [
      {
        source: "/:path*\\.(svg|png|ico|woff2|woff|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
