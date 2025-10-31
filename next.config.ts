import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '/organization',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.thriveassessmentcare.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async rewrites() {
    return [
      {
        source: '/claimant/availability',
        destination: '/organization/claimant/availability',
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
