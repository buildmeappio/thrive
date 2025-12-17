import env from '@/config/env';
import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';

const options: S3ClientConfig = {
  region: 'ca-central-1',
};

if (env.AWS_REGION && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
  options.region = env.AWS_REGION;
  options.credentials = {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  };
}

export const s3Client = new S3Client({
  ...options,
});
