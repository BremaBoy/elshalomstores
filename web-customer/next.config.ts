import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // The repository contains separate lockfiles for each app. Pinning the
    // workspace root prevents Next from accidentally serving the monorepo root.
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'yevreptswbayuxmxlblt.supabase.co',
      },
    ],
  },
};

export default nextConfig;
