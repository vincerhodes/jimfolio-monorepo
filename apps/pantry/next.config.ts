import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    basePath: process.env.VERCEL ? "" : "/pantry",
};

export default nextConfig;
