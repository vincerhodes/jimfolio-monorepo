import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    basePath: process.env.VERCEL ? "" : "/pantry",
};

export default nextConfig;
