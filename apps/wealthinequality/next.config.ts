import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/wealthinequality',
  assetPrefix: '/wealthinequality',
  reactStrictMode: true,
  images: {
    domains: [],
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
