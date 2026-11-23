import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    async rewrites() {
        const enablePortfolioProxy =
            process.env.NODE_ENV === 'development' ||
            process.env.PORTFOLIO_PROXY === '1';

        if (!enablePortfolioProxy) {
            return [];
        }

        const wesplitPort = process.env.WESPLIT_PORT ?? "3110";

        return [
            {
                source: '/wesplit/:path*',
                destination: `http://localhost:${wesplitPort}/wesplit/:path*`
            }
        ];
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
