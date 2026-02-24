import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { ENV } from '@/constants/variables';

const s3Config: S3ClientConfig = {
  region: 'ca-central-1',
};

if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
  console.log('AWS credentials found, using them');
  s3Config.region = ENV.AWS_REGION!;
  s3Config.credentials = {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(s3Config);

export default s3Client;
