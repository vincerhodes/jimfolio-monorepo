import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.VERCEL ? "" : "/jade-chinese",
};

export default nextConfig;
