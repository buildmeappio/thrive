import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/db";
import { ENV } from "@/constants/variables";

// Allowed file types for document uploads
const ALLOWED_FILE_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".xls",
  ".xlsx",
];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum number of files per request
const MAX_FILES_PER_REQUEST = 10;

/**
 * Initialize S3 Client with proper credentials
 */
function initializeS3Client() {
  if (!ENV.AWS_REGION) {
    throw new Error("AWS_REGION is not configured");
  }

  const credentials =
    ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: ENV.AWS_ACCESS_KEY_ID,
          secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
        }
      : undefined;

  if (!credentials) {
    throw new Error("AWS credentials are not configured");
  }

  return new S3Client({
    region: ENV.AWS_REGION,
    credentials,
  });
}

/**
 * Validate file type and size
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size === 0) {
    return { valid: false, error: `File "${file.name}" is empty` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum size of ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB`,
    };
  }

  // Check file type
  const isValidType = ALLOWED_FILE_TYPES.includes(file.type);
  const fileExtension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();
  const isValidExtension = ALLOWED_FILE_EXTENSIONS.includes(fileExtension);

  if (!isValidType && !isValidExtension) {
    return {
      valid: false,
      error: `File "${file.name}" has an unsupported file type. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, XLS, XLSX`,
    };
  }

  return { valid: true };
}

/**
 * Create a unique filename with timestamp and sanitization
 */
function createFileName(file: File): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = file.name.substring(file.name.lastIndexOf("."));
  const sanitizedBaseName = file.name
    .substring(0, file.name.lastIndexOf("."))
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 50); // Limit filename length

  return `${timestamp}-${randomString}-${sanitizedBaseName}${fileExtension}`;
}

/**
 * Create S3 key for the file
 */
function createS3Key(file: File, userId?: string): string {
  const fileName = createFileName(file);
  const userFolder = userId ? `${userId}/` : "";
  return `documents/examiner/${userFolder}${fileName}`;
}

/**
 * Upload a single file to S3
 */
async function uploadToS3(
  s3Client: S3Client,
  file: File,
  key: string
): Promise<void> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const command = new PutObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
      },
    });

    await s3Client.send(command);
    console.log(`File uploaded to S3: ${file.name}`);
  } catch (error) {
    console.error(`Failed to upload file to S3: ${file.name}`, error);
    throw new Error(
      `Failed to upload file "${file.name}" to S3: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Save document metadata to database
 */
async function saveDocumentToDatabase(
  fileName: string,
  originalName: string,
  fileSize: number,
  fileType: string,
  _s3Key: string,
  _userId?: string
) {
  try {
    const document = await prisma.documents.create({
      data: {
        name: fileName,
        size: fileSize,
        type: fileType,
        // Add userId if your schema supports it
        // userId: userId,
        // s3Key: s3Key, // If your schema has this field
      },
    });

    return document;
  } catch (error) {
    console.error("Failed to save document to database:", error);
    throw new Error(
      `Failed to save document metadata: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * POST /api/documents/upload
 * Uploads one or multiple documents/images to S3
 *
 * Form Data:
 * - files: File | File[] (required) - One or more files to upload
 * - userId: string (optional) - User ID to organize files in S3
 *
 * Response Success:
 * {
 *   "success": true,
 *   "message": "2 file(s) uploaded successfully",
 *   "data": {
 *     "documents": [
 *       {
 *         "id": "uuid",
 *         "name": "filename.pdf",
 *         "originalName": "original.pdf",
 *         "size": 123456,
 *         "type": "application/pdf",
 *         "s3Key": "documents/examiner/user-id/timestamp-filename.pdf",
 *         "url": "https://cdn.example.com/documents/examiner/user-id/timestamp-filename.pdf"
 *       }
 *     ],
 *     "totalUploaded": 2
 *   }
 * }
 *
 * Response Error:
 * {
 *   "success": false,
 *   "message": "Error message",
 *   "errors": ["Detailed error 1", "Detailed error 2"]
 * }
 */
export async function POST(request: NextRequest) {
  let s3Client: S3Client | null = null;

  try {
    // Check if S3 bucket is configured
    if (!ENV.AWS_S3_BUCKET) {
      return NextResponse.json(
        {
          success: false,
          message: "S3 bucket is not configured",
          errors: ["AWS_S3_BUCKET_NAME environment variable is missing"],
        },
        { status: 500 }
      );
    }

    // Initialize S3 client
    try {
      s3Client = initializeS3Client();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initialize S3 client",
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const userId = formData.get("userId") as string | null;

    // Validate that files are provided
    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No files provided",
          errors: [
            "Please provide at least one file using the 'files' field in form-data",
          ],
        },
        { status: 400 }
      );
    }

    // Check maximum files limit
    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files allowed per request`,
          errors: [
            `Received ${files.length} files, but maximum allowed is ${MAX_FILES_PER_REQUEST}`,
          ],
        },
        { status: 400 }
      );
    }

    // Validate all files first
    const validationErrors: string[] = [];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid && validation.error) {
        validationErrors.push(validation.error);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "File validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Upload files to S3 and save to database
    const uploadedDocuments: any[] = [];
    const uploadErrors: string[] = [];

    for (const file of files) {
      try {
        const s3Key = createS3Key(file, userId || undefined);
        const fileName = s3Key.split("/").pop() || file.name;

        // Upload to S3
        await uploadToS3(s3Client, file, s3Key);

        // Save to database
        const document = await saveDocumentToDatabase(
          fileName,
          file.name,
          file.size,
          file.type,
          s3Key,
          userId || undefined
        );

        // Construct CDN URL if configured
        const cdnUrl = ENV.NEXT_PUBLIC_CDN_URL
          ? `${ENV.NEXT_PUBLIC_CDN_URL}/${s3Key}`
          : null;

        uploadedDocuments.push({
          id: document.id,
          name: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          s3Key: s3Key,
          url: cdnUrl,
          createdAt: document.createdAt,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        uploadErrors.push(`Failed to upload "${file.name}": ${errorMessage}`);
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }

    // Check if any files were successfully uploaded
    if (uploadedDocuments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload all files",
          errors: uploadErrors,
        },
        { status: 500 }
      );
    }

    // Partial success if some files failed
    if (uploadErrors.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: `${uploadedDocuments.length} of ${files.length} file(s) uploaded successfully`,
          data: {
            documents: uploadedDocuments,
            totalUploaded: uploadedDocuments.length,
            totalFailed: uploadErrors.length,
          },
          warnings: uploadErrors,
        },
        { status: 207 } // Multi-Status
      );
    }

    // Full success
    return NextResponse.json(
      {
        success: true,
        message: `${uploadedDocuments.length} file(s) uploaded successfully`,
        data: {
          documents: uploadedDocuments,
          totalUploaded: uploadedDocuments.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in document upload:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during file upload",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/upload
 * Returns API information and requirements
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: "/api/documents/upload",
      method: "POST",
      contentType: "multipart/form-data",
      fields: {
        files: {
          type: "File | File[]",
          required: true,
          description: "One or more files to upload",
        },
        userId: {
          type: "string",
          required: false,
          description: "Optional user ID to organize files in S3",
        },
      },
      limits: {
        maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
        maxFilesPerRequest: MAX_FILES_PER_REQUEST,
        allowedTypes: ALLOWED_FILE_TYPES,
        allowedExtensions: ALLOWED_FILE_EXTENSIONS,
      },
    },
    { status: 200 }
  );
}
