import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    basePath: '/~phungj/tis-100',
    images: {
        unoptimized: true,
    },
};

export default nextConfig;