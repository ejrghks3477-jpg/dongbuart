import type { NextConfig } from "next";

const nextConfig = {
  // 타입스크립트 에러가 있어도 빌드 통과시키기
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint 검사 에러도 빌드할 때는 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;