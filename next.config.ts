import type { NextConfig } from 'next';

const frontendURL = process.env.FRONTEND_URL;

if (!frontendURL) {
  throw new Error('FRONTEND_URL is not set');
}

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
        source: '/claimant/:path*',
        destination: `${frontendURL}/organization/claimant/:path*`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
