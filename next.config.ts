import type { NextConfig } from 'next';

const frontendURL = process.env.NEXT_PUBLIC_APP_URL;

if (!frontendURL) {
  throw new Error('NEXT_PUBLIC_APP_URL is not set');
}

const basePath = '/organization';

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
        destination: `${frontendURL}/${basePath}/claimant/:path*`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
