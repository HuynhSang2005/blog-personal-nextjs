import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack by default (stable in Next.js 16)

  // Cache Components - explicit caching model for Next.js 16
  cacheComponents: true,

  // React Compiler (stable in Next.js 16)
  reactCompiler: true,

  // TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // Images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Experimental features for performance
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
