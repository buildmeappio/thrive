import type { NextConfig } from 'next';

// Use env in config; fallback for local dev when .env is missing (e.g. monorepo pnpm dev)
const frontendURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

const basePath = '/organization';

const nextConfig: NextConfig = {
  transpilePackages: ['@thrive/database'],
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
  // Exclude Node.js-only packages from client bundles
  serverExternalPackages: [
    'nodemailer',
    'googleapis',
    'google-auth-library',
    'agent-base',
    'https-proxy-agent',
  ],
  // Turbopack config (for dev with Turbopack)
  turbopack: {},
  // Webpack config (for production builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        crypto: false,
      };
    }
    return config;
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
