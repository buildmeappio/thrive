'use server';

import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import prisma from './db';
import { ENV } from '@/constants/variables';
import { AppError } from '@/types/common';
import s3Client from './s3-client';

const createFileName = (file: File) => {
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
  return uniqueFileName;
};

const createKey = (file: File) => {
  return `documents/examiner/${createFileName(file)}`;
};

async function uploadFilesToS3(formData: FormData) {
  try {
    const files = formData.getAll('files') as File[];
    const uploadedFiles: {
      name: string;
      originalName: string;
      size: number;
      type: string;
    }[] = [];

    if (files.length === 0) {
      return { error: 'No files provided' };
    }

    // Upload each file to S3
    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename with timestamp and sanitization
        const uniqueFileName = createFileName(file);
        const key = createKey(file);

        const command = new PutObjectCommand({
          Bucket: ENV.AWS_S3_BUCKET!,
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
          size: file.size,
          type: file.type,
        });
      }
    }

    const documents = await prisma.documents.createManyAndReturn({
      data: uploadedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    });

    revalidatePath('/');

    return {
      success: true,
      documents,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
    };
  } catch (error) {
    console.error('S3 Upload error:', error);
    return { error: 'Failed to upload files to S3' };
  }
}

type UploadFileToS3Response =
  | { success: false; error: string }
  | {
      success: true;
      document: { id: string; name: string; size: number; type: string };
    };

const uploadFileToS3 = async (file: File): Promise<UploadFileToS3Response> => {
  try {
    // Validate AWS configuration before attempting upload
    if (!ENV.AWS_REGION || !ENV.AWS_S3_BUCKET) {
      return {
        success: false,
        error:
          'AWS configuration is missing. Please check AWS_REGION and AWS_S3_BUCKET_NAME environment variables.',
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueFileName = createFileName(file);
    const key = createKey(file);

    console.log(`Uploading file to S3: ${key} (Bucket: ${ENV.AWS_S3_BUCKET})`);

    const command = new PutObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Upload to S3 first - only proceed if this succeeds
    await s3Client.send(command);
    console.log(`✅ S3 upload successful: ${key}`);

    // Check if document with this name already exists (idempotency check)
    const existingDocument = await prisma.documents.findFirst({
      where: {
        name: uniqueFileName,
        deletedAt: null,
      },
    });

    if (existingDocument) {
      console.log(`Document with name ${uniqueFileName} already exists, returning existing record`);
      return {
        success: true,
        document: {
          id: existingDocument.id,
          name: existingDocument.name,
          size: existingDocument.size,
          type: existingDocument.type,
        },
      };
    }

    // Only create database record if S3 upload succeeded and document doesn't exist
    let document;
    try {
      document = await prisma.documents.create({
        data: {
          name: uniqueFileName,
          size: file.size,
          type: file.type,
        },
      });
    } catch (dbError: unknown) {
      // Handle unique constraint violation (if name has unique constraint)
      const prismaError = dbError as {
        code?: string;
        meta?: { target?: string[] };
      };
      if (prismaError.code === 'P2002') {
        // Unique constraint violation - try to find existing document
        console.warn(
          `Unique constraint violation for ${uniqueFileName}, fetching existing document`
        );
        const existingDoc = await prisma.documents.findFirst({
          where: {
            name: uniqueFileName,
            deletedAt: null,
          },
        });
        if (existingDoc) {
          document = existingDoc;
        } else {
          throw dbError;
        }
      } else {
        throw dbError;
      }
    }

    return {
      success: true,
      document: {
        id: document.id,
        name: uniqueFileName,
        size: file.size,
        type: file.type,
      },
    };
  } catch (error: unknown) {
    console.error('S3 Upload error:', error);

    // Handle specific AWS errors
    const awsError = error as {
      name?: string;
      message?: string;
      Code?: string;
    };
    const errorName = awsError.name || awsError.Code;

    if (errorName === 'AccessDenied' || errorName === '403') {
      return {
        success: false,
        error:
          "Access denied to S3 bucket. Please check:\n1. AWS credentials are set (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)\n2. IAM user/role has 's3:PutObject' permission\n3. Bucket policy allows access",
      };
    }

    if (errorName === 'InvalidAccessKeyId' || errorName === 'SignatureDoesNotMatch') {
      return {
        success: false,
        error:
          'Invalid AWS credentials. Please check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env.local file.',
      };
    }

    if (errorName === 'NoSuchBucket') {
      return {
        success: false,
        error: `S3 bucket not found: ${ENV.AWS_S3_BUCKET}. Please check AWS_S3_BUCKET_NAME environment variable.`,
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file to S3';
    return {
      success: false,
      error: `S3 upload failed: ${errorMessage}`,
    };
  }
};

const getFileFromS3 = async (
  filename: string
): Promise<
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      data: Buffer;
      contentType: string;
    }
> => {
  try {
    // Validate filename
    if (!filename || filename.trim() === '') {
      return {
        success: false,
        error: 'Filename is required',
      };
    }

    const key = `documents/examiner/${filename}`;

    const command = new GetObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
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
    const buffer = Buffer.from(await response.Body?.transformToByteArray());

    return {
      success: true,
      data: buffer,
      contentType: response.ContentType || 'application/octet-stream',
    };
  } catch (error: unknown) {
    console.error('S3 Get error:', error);

    // Handle specific S3 errors
    const s3Error = error as AppError & { name?: string };
    if (s3Error.name === 'NoSuchKey') {
      return {
        success: false,
        error: 'File not found in S3',
      };
    }

    if (s3Error.name === 'AccessDenied') {
      return {
        success: false,
        error: 'Access denied to S3 bucket',
      };
    }

    return {
      success: false,
      error: s3Error.message || 'Failed to get file from S3',
    };
  }
};

const getPresignedUrlFromS3 = async (
  filename: string,
  expiresIn: number = 3600
): Promise<{ success: false; error: string } | { success: true; url: string }> => {
  try {
    if (!filename || filename.trim() === '') {
      return {
        success: false,
        error: 'Filename is required',
      };
    }

    // Validate AWS configuration
    if (!ENV.AWS_REGION || !ENV.AWS_S3_BUCKET) {
      return {
        success: false,
        error:
          'AWS configuration is missing. Please check AWS_REGION and AWS_S3_BUCKET_NAME environment variables.',
      };
    }

    // Log configuration status (without exposing secrets)
    console.log(`Generating presigned URL for: ${filename}`);
    console.log(`AWS Region: ${ENV.AWS_REGION}`);
    console.log(`S3 Bucket: ${ENV.AWS_S3_BUCKET}`);
    console.log(
      `Credentials configured: ${!!(ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY)}`
    );

    const key = `documents/examiner/${filename}`;
    console.log(`S3 Key: ${key}`);

    const command = new GetObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`✅ Presigned URL generated successfully`);

    return {
      success: true,
      url,
    };
  } catch (error: unknown) {
    console.error('S3 Presigned URL error:', error);

    // Handle specific AWS errors
    const awsError = error as {
      name?: string;
      message?: string;
      Code?: string;
      $metadata?: { httpStatusCode?: number };
    };
    const errorName = awsError.name || awsError.Code;
    const httpStatusCode = awsError.$metadata?.httpStatusCode;

    console.error(`AWS Error Details:`, {
      name: errorName,
      message: awsError.message,
      httpStatusCode,
      filename,
    });

    if (errorName === 'AccessDenied' || errorName === '403' || httpStatusCode === 403) {
      return {
        success: false,
        error:
          "Access denied to S3 bucket. Please check:\n1. AWS credentials are set (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)\n2. IAM user/role has 's3:GetObject' permission\n3. Bucket policy allows access to the key\n4. The document exists in S3 at: documents/examiner/" +
          filename,
      };
    }

    if (errorName === 'NoSuchKey' || errorName === '404' || httpStatusCode === 404) {
      return {
        success: false,
        error: `Document not found in S3: ${filename}. The file may not have been uploaded successfully.`,
      };
    }

    if (errorName === 'InvalidAccessKeyId' || errorName === 'SignatureDoesNotMatch') {
      return {
        success: false,
        error:
          'Invalid AWS credentials. Please check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env.local file.',
      };
    }

    if (errorName === 'CredentialsProviderError' || errorName === 'NoCredentials') {
      return {
        success: false,
        error:
          'AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env.local file, or ensure IAM role is configured for production.',
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate presigned URL';
    return {
      success: false,
      error: `Failed to generate presigned URL: ${errorMessage}`,
    };
  }
};

export { uploadFileToS3, uploadFilesToS3, getFileFromS3, getPresignedUrlFromS3 };
