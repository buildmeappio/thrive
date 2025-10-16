import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';

const options: S3ClientConfig = {
  region: 'ca-central-1',
};

if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  options.region = process.env.AWS_REGION;
  options.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

export const s3Client = new S3Client({
  ...options,
});
