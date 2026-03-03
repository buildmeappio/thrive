import type { NextConfig } from 'next';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.thriveassessmentcare.com';
const protocol = cdnUrl.startsWith('https') ? 'https' : 'http';
const hostname = cdnUrl.split('//')[1];

const nextConfig: NextConfig = {
  // No basePath — central portal runs at root
  transpilePackages: ['@thrive/database-master', 'agenda', '@agendajs/postgres-backend'],
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
      },
    ],
  },
};

export default nextConfig;
