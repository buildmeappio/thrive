import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { ENV } from '@/constants/variables';

// Initialize S3 Client
// For ECS: Don't pass credentials, let SDK use IAM role automatically
// For local dev: Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local
const config: S3ClientConfig = {
  region: ENV.AWS_REGION || 'ca-central-1',
};

// Only add credentials if they're explicitly provided (for local development)
if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
  config.credentials = {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  };
}

export const s3Client = new S3Client(config);

