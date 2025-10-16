"use server";

import { S3Client, S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import prisma from "./db";
import { ENV } from "@/constants/variables";

// For ECS: Don't pass credentials, let SDK use IAM role automatically
// For local dev: Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local
const s3Config: S3ClientConfig = {
  region: ENV.AWS_REGION!,
};

const s3Client = new S3Client(s3Config);

const createFileName = (file: File) => {
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
  return uniqueFileName;
};

const createKey = (file: File) => {
  return `documents/examiner/${createFileName(file)}`;
};

async function uploadFilesToS3(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[];
    const uploadedFiles: {
      name: string;
      originalName: string;
      size: number;
      type: string;
    }[] = [];

    if (files.length === 0) {
      return { error: "No files provided" };
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
      data: uploadedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    });

    revalidatePath("/");

    return {
      success: true,
      documents,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
    };
  } catch (error) {
    console.error("S3 Upload error:", error);
    return { error: "Failed to upload files to S3" };
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
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = createKey(file);
    const command = new PutObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });
    await s3Client.send(command);
    const document = await prisma.documents.create({
      data: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
    return {
      success: true,
      document: {
        id: document.id,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    };
  } catch (error) {
    console.error("S3 Upload error:", error);
    return { success: false, error: "Failed to upload file to S3" };
  }
};

export { uploadFileToS3, uploadFilesToS3 };
