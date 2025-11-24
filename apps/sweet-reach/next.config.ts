import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/sweet-reach',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:52340', 'localhost:52340']
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self';"
          }
        ],
      },
    ];
  }
};

export default nextConfig;
