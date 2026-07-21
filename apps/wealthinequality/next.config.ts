import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: process.env.VERCEL ? '' : '/wealthinequality',
  assetPrefix: process.env.VERCEL ? undefined : '/wealthinequality',
  reactStrictMode: true,
  images: {
    domains: [],
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
