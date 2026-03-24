import type { NextConfig } from "next";

export const BASE_PATH = '/~phungj/tis-100';

const nextConfig: NextConfig = {
    output: 'export',
    basePath: BASE_PATH,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;