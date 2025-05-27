// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;