import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove deprecated serverComponentsExternalPackages option
  // Prisma works fine without external package configuration in Next.js 16
  
  // Production deployment configuration for subdirectory
  basePath: '/veriflow',
  assetPrefix: '/veriflow',
  
  // Ensure proper trailing slash handling for subdirectory deployment
  trailingSlash: true,

  // Ignore TypeScript build errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
