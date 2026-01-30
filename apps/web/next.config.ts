import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable Turbopack by default (stable in Next.js 16)

  // Cache Components - temporarily disabled for migration
  // TODO: Enable with proper Suspense boundaries after migration is complete
  // cacheComponents: true,

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

export default withContentCollections(withNextIntl(nextConfig));
