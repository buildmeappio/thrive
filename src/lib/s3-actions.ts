'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export async function uploadFilesToS3(formData: FormData) {
  try {
    const files = formData.getAll('files') as File[];
    const uploadedFiles: { name: string; originalName: string }[] = [];

    if (files.length === 0) {
      return { error: 'No files provided' };
    }

    // Upload each file to S3
    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename with timestamp and sanitization
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
        const key = `documents/${uniqueFileName}`;

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          Metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        });

        await s3Client.send(command);

        uploadedFiles.push({
          name: uniqueFileName, // This will be stored in DB
          originalName: file.name, // Original name for display
        });
      }
    }

    revalidatePath('/');

    return {
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
    };
  } catch (error) {
    console.error('S3 Upload error:', error);
    return { error: 'Failed to upload files to S3' };
  }
}
