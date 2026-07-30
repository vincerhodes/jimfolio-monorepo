import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    basePath: process.env.VERCEL ? "" : "/fibr",
};

export default nextConfig;
