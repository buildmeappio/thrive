'use server';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';
import { s3Client } from './s3-client';

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export interface UploadedFile {
  name: string;
  originalName: string;
  type: string;
  size: number;
}

export interface UploadResult {
  success?: boolean;
  files?: UploadedFile[];
  message?: string;
  error?: string;
}

export async function uploadFilesToS3(formData: FormData): Promise<UploadResult> {
  try {
    const files = formData.getAll('files') as File[];
    const uploadedFiles: UploadedFile[] = [];

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
          name: uniqueFileName,
          originalName: file.name,
          type: file.type,
          size: file.size,
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

export async function deleteFileFromS3(
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = `documents/${filename}`;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('S3 Delete error:', error);
    return { success: false, error: 'Failed to delete file from S3' };
  }
}
