import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aidar/shared"],
  // Self-contained server bundle for Docker/Coolify. outputFileTracingRoot must
  // point at the monorepo root so pnpm's symlinked workspace deps are traced.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
