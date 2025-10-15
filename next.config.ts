import type { NextConfig } from 'next';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.thriveassessmentcare.com';
const protocol = cdnUrl.startsWith('https') ? 'https' : 'http';
const hostname = cdnUrl.split('//')[1];

console.log({ protocol, hostname });

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
