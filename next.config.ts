import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!: Dangerously allow production builds despite TypeScript errors.
    ignoreBuildErrors: true,
  },
  //basePath: '/pagedemo',
};

export default nextConfig;
