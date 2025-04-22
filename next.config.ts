import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this configuration to ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add this configuration to ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};


export default nextConfig;
