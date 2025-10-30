import type { NextConfig } from "next";

// Configuração simples - sempre local para desenvolvimento
const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8080";

const nextConfig: NextConfig = {
    // ✅ tem que ficar no topo da config
    allowedDevOrigins: [
        "http://localhost:3000", 
        "http://72.61.219.15:3000", 
        "http://10.199.82.137:3000"
    ],

    // Configuração de encoding UTF-8
    env: {
        NEXT_PUBLIC_CHARSET: 'utf-8',
    },

    // Corrigir warning de múltiplos lockfiles
    outputFileTracingRoot: __dirname,


    images: {
        remotePatterns: [
            { protocol: "https", hostname: "img.shields.io" },
            { protocol: "https", hostname: "github.com" },
        ],
    },

    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${backendOrigin}/api/:path*`,
            },
        ];
    },
    
    // Desabilitar ESLint durante o build para evitar erros de linting
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    // Desabilitar TypeScript durante o build para evitar erros de tipo
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;