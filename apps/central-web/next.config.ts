import type { NextConfig } from 'next';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.thriveassessmentcare.com';
const protocol = cdnUrl.startsWith('https') ? 'https' : 'http';
const hostname = cdnUrl.split('//')[1];

const s3Hostname =
  process.env.AWS_S3_BUCKET_NAME && process.env.AWS_S3_REGION
    ? `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com`
    : null;

const nextConfig: NextConfig = {
  // No basePath — central portal runs at root
  transpilePackages: ['@thrive/database-master', 'agenda', '@agendajs/postgres-backend'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Logo upload + form data (UI says "PNG, JPG up to 5MB")
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
      },
      ...(s3Hostname
        ? [
            {
              protocol: 'https' as const,
              hostname: s3Hostname,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
