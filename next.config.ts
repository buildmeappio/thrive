import type { NextConfig } from 'next';

const frontendURL = process.env.FRONTEND_URL;

if (!frontendURL) {
  throw new Error('FRONTEND_URL is not set');
}

// Provide a default BASE_PATH for local development if not set
const basePath = process.env.BASE_PATH || '/organization';

const nextConfig: NextConfig = {
  /* config options here */
  basePath,
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
        destination: `${frontendURL}${basePath}/claimant/:path*`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
