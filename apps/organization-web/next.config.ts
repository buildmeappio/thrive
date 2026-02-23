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
