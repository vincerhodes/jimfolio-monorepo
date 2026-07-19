import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    basePath: process.env.VERCEL ? "" : "/crema",
};

export default nextConfig;
