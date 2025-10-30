// mottu-web/next.config.ts
import type { NextConfig } from "next";

const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8080";

const nextConfig: NextConfig = {
    // ✅ tem que ficar no topo da config
    allowedDevOrigins: ["http://10.199.82.137:3000", "http://localhost:3000"],

    images: {
        remotePatterns: [
            { protocol: "https", hostname: "img.shields.io" },
            { protocol: "https", hostname: "github.com" },
        ],
    },

    // Desabilitar otimização CSS temporariamente para resolver erro de build
    experimental: {
        optimizeCss: false,
    },
    
    // Desabilitar minificação completamente (removido swcMinify que não existe no Next.js 15)
    
    // Desabilitar ESLint durante o build
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    // Desabilitar verificação de tipos durante o build
    typescript: {
        ignoreBuildErrors: true,
    },
    
    // Configuração do webpack para desabilitar minificação
    webpack: (config: any) => {
        config.optimization.minimize = false;
        config.optimization.minimizer = [];
        return config;
    },

    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${backendOrigin}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
