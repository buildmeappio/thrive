'use server';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('error', error => reject(error));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function getFileFromS3(filename: string): Promise<{
  success: boolean;
  data?: Buffer;
  contentType?: string;
  error?: string;
}> {
  try {
    // Validate filename
    if (!filename || filename.trim() === '') {
      return {
        success: false,
        error: 'Filename is required',
      };
    }

    const key = `documents/${filename}`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Check if Body exists in response
    if (!response.Body) {
      return {
        success: false,
        error: 'No data returned from S3',
      };
    }

    // Convert the stream to Buffer
    const buffer = await streamToBuffer(response.Body as NodeJS.ReadableStream);

    return {
      success: true,
      data: buffer,
      contentType: response.ContentType,
    };
  } catch (error: any) {
    console.error('S3 Get error:', error);

    // Handle specific S3 errors
    if (error.name === 'NoSuchKey') {
      return {
        success: false,
        error: 'File not found in S3',
      };
    }

    if (error.name === 'AccessDenied') {
      return {
        success: false,
        error: 'Access denied to S3 bucket',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to get file from S3',
    };
  }
}
