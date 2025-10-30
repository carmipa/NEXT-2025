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
