import type { NextConfig } from "next";

function inferPortFromArgv(): string | undefined {
    let port: string | undefined;

    for (let i = 0; i < process.argv.length - 1; i += 1) {
        const arg = process.argv[i];
        if (arg === "-p" || arg === "--port") {
            port = process.argv[i + 1];
        }
    }

    return port;
}

const nextConfig: NextConfig = {
    async rewrites() {
        const enablePortfolioProxy =
            process.env.NODE_ENV === 'development' ||
            process.env.CONNEXIA_PROXY === '1' ||
            process.env.PORTFOLIO_PROXY === '1';

        if (!enablePortfolioProxy) {
            return [];
        }

        const jimfolioPort = process.env.PORT ?? inferPortFromArgv();
        const useAltPortfolioPorts = jimfolioPort === "3100";

        const connexiaPort = process.env.CONNEXIA_PORT ?? (useAltPortfolioPorts ? "3103" : "3005");
        const sweetReachPort = process.env.SWEET_REACH_PORT ?? (useAltPortfolioPorts ? "3101" : "3001");
        const veriflowPort = process.env.VERIFLOW_PORT ?? (useAltPortfolioPorts ? "3102" : "3003");
        const wealthInequalityPort = process.env.WEALTHINEQUALITY_PORT ?? (useAltPortfolioPorts ? "3104" : "3002");

        return [
            {
                source: '/connexia/:path*',
                destination: `http://localhost:${connexiaPort}/connexia/:path*`
            },
            {
                source: '/sweet-reach/:path*',
                destination: `http://localhost:${sweetReachPort}/sweet-reach/:path*`
            },
            {
                source: '/veriflow/:path*',
                destination: `http://localhost:${veriflowPort}/veriflow/:path*`
            },
            {
                source: '/wealthinequality/:path*',
                destination: `http://localhost:${wealthInequalityPort}/wealthinequality/:path*`
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
