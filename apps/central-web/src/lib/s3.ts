import { S3Client, GetObjectCommand, type S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const options: S3ClientConfig = {
      region: process.env.AWS_S3_REGION!,
    };

    if (process.env.AWS_S3_ACCESS_KEY_ID && process.env.AWS_S3_SECRET_ACCESS_KEY) {
      options.credentials = {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
      };
    }
    s3Client = new S3Client(options);
  }
  return s3Client;
}

/**
 * Returns a display URL for a logo. If it's already a URL (http/https), returns as-is.
 * If it's an S3 key (e.g. logos/filename.png), returns a signed URL.
 */
export async function getLogoUrl(keyOrUrl: string | null | undefined): Promise<string | null> {
  if (!keyOrUrl) return null;
  if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
    return keyOrUrl;
  }
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) return null;

  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: keyOrUrl,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}
