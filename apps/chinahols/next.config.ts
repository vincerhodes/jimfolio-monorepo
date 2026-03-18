import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/chinahols",
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/itinerary.html", destination: "/itinerary", permanent: true },
      { source: "/study.html", destination: "/study", permanent: true },
      { source: "/planning.html", destination: "/planning", permanent: true },
      { source: "/index-archive.html", destination: "/archive", permanent: true },
    ];
  },
};

export default nextConfig;
