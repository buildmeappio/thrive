'use server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { getS3Client } from '@/lib/s3';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/-+/g, '-') || 'logo';
}

/**
 * Uploads a logo file to S3 and returns the key (logos/{filename}).
 * Called during form submission. Uses uuid prefix for uniqueness.
 */
export async function uploadLogoToS3(
  formData: FormData
): Promise<{ key: string } | { error: string }> {
  const file = formData.get('logo') as File | null;
  if (!file || !(file instanceof File)) {
    return { error: 'No logo file provided' };
  }

  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' };
  }

  const filename = sanitizeFilename(file.name);
  const key = `logos/${uuidv4()}-${filename}`;

  const s3 = getS3Client();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
    return { key };
  } catch {
    return { error: 'Failed to upload logo' };
  }
}
