import type { NextConfig } from 'next';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.thriveassessmentcare.com';
const cdn = new URL(cdnUrl);
const protocol: 'http' | 'https' = cdn.protocol === 'https:' ? 'https' : 'http';
const hostname = cdn.hostname;

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '/organization',
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
