// apps/marketing/next.config.js
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Webpack configuration for path aliases
  webpack(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd(), "apps/marketing"),
    }
    return config
  },
};

export default nextConfig;