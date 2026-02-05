// next.config.mjs
/** @type {import('next').NextConfig} */

// Check if we're building for static export
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  output: isStaticExport ? 'export' : 'standalone',
  // For static export, we need to disable image optimization since it requires a server
  ...(isStaticExport && {
    images: {
      unoptimized: true,
    },
    // Trailing slashes help with S3 static hosting
    trailingSlash: true,
  }),
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;