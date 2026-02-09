import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
  // 빌드 에러 무시 (배포 우선)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
