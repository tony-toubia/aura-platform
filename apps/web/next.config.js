// apps/web/next.config.js
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Re-enabled after fixing duplicate aura creation
  
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // If you ever switch to Turbopack:
  turbopack: {
    resolveAlias: {
      "@": path.resolve(process.cwd(), "apps/web"),
    },
  },

  // For the default Next.js Webpack build (and for your editor/TS to pick it up):
  webpack(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd(), "apps/web"),
    }
    return config
  },
};

export default nextConfig;
