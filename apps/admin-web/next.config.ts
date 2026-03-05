import type { NextConfig } from 'next';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.thriveassessmentcare.com';
const protocol = cdnUrl.startsWith('https') ? 'https' : 'http';
const hostname = cdnUrl.split('//')[1];

// Extract S3 bucket hostname from environment variable
// S3 bucket URLs follow pattern: bucket-name.s3.region.amazonaws.com
const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
const s3Region = process.env.AWS_S3_REGION || 'ca-central-1';
const s3Hostname = s3BucketName ? `${s3BucketName}.s3.${s3Region}.amazonaws.com` : null;

const nextConfig: NextConfig = {
  transpilePackages: ['@thrive/database', '@thrive/database-master'],
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
      },
      // Add S3 bucket hostname if configured
      ...(s3Hostname
        ? [
            {
              protocol: 'https' as const,
              hostname: s3Hostname,
              pathname: '/**',
            },
          ]
        : []),
      // Also allow S3 buckets in ca-central-1 region (wildcard for bucket name)
      {
        protocol: 'https' as const,
        hostname: '*.s3.ca-central-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
