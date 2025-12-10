import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import prisma from "@/lib/db";
import { ENV } from "@/constants/variables";
import { log, error, warn } from "@/utils/logger";
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
  log("🔧 Initializing S3 client...");

  if (!ENV.AWS_REGION) {
    error("❌ AWS_REGION is not configured");
    throw new Error("AWS_REGION is not configured");
  }

  log(`✅ AWS Region: ${ENV.AWS_REGION}`);

  const config: S3ClientConfig = {
    region: ENV.AWS_REGION,
  };

  if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
    log("✅ Using AWS credentials from environment");
    config.credentials = {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    };
  } else {
    warn("⚠️  No AWS credentials provided, using default credential chain");
  }

  return new S3Client(config);
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
    log(`📤 Converting file "${file.name}" to buffer...`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    log(`✅ Buffer created (${buffer.length} bytes)`);

    log(`📤 Preparing S3 upload command...`);
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

    log(`📤 Uploading to S3:`, {
      bucket: ENV.AWS_S3_BUCKET,
      key: key,
      contentType: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`,
    });

    await s3Client.send(command);
    log(`✅ File uploaded to S3 successfully: ${file.name}`);
  } catch (err) {
    error(`❌ Failed to upload file to S3: ${file.name}`);
    error(`📋 S3 upload error details:`, {
      fileName: file.name,
      s3Key: key,
      bucket: ENV.AWS_S3_BUCKET,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    error(`📋 Full error:`, err);

    throw new Error(
      `Failed to upload file "${file.name}" to S3: ${
        err instanceof Error ? err.message : "Unknown error"
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
  s3Key: string,
  userId?: string
) {
  try {
    log(`💾 Saving document metadata to database:`, {
      fileName,
      originalName,
      size: `${(fileSize / 1024).toFixed(2)}KB`,
      type: fileType,
      s3Key,
      userId: userId || "Not provided",
    });

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

    log(`✅ Document saved to database with ID: ${document.id}`);
    return document;
  } catch (err) {
    error("❌ Failed to save document to database");
    error("📋 Database error details:", {
      fileName,
      originalName,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    error("📋 Full error:", err);

    throw new Error(
      `Failed to save document metadata: ${
        err instanceof Error ? err.message : "Unknown error"
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
  const requestId = Math.random().toString(36).substring(7);
  log(`[${requestId}] 📤 Document upload request initiated`);

  let s3Client: S3Client | null = null;

  try {
    // Check if S3 bucket is configured
    if (!ENV.AWS_S3_BUCKET) {
      error(`[${requestId}] ❌ S3 bucket not configured`);
      return NextResponse.json(
        {
          success: false,
          message: "S3 bucket is not configured",
          errors: ["AWS_S3_BUCKET_NAME environment variable is missing"],
        },
        { status: 500 }
      );
    }

    log(`[${requestId}] ✅ S3 bucket configured: ${ENV.AWS_S3_BUCKET}`);

    // Initialize S3 client
    try {
      s3Client = initializeS3Client();
      log(`[${requestId}] ✅ S3 client initialized successfully`);
    } catch (err) {
      error(`[${requestId}] ❌ Failed to initialize S3 client:`, err);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initialize S3 client",
          errors: [err instanceof Error ? err.message : "Unknown error"],
        },
        { status: 500 }
      );
    }

    // Parse form data
    log(`[${requestId}] 📋 Parsing form data...`);
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const userId = formData.get("userId") as string | null;

    log(`[${requestId}] 📊 Request details:`, {
      filesCount: files.length,
      userId: userId || "Not provided",
      fileNames: files.map((f) => f.name),
      fileSizes: files.map((f) => `${(f.size / 1024).toFixed(2)}KB`),
    });

    // Validate that files are provided
    if (!files || files.length === 0) {
      error(`[${requestId}] ❌ No files provided in request`);
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
      error(
        `[${requestId}] ❌ Too many files: ${files.length} (max: ${MAX_FILES_PER_REQUEST})`
      );
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
    log(`[${requestId}] 🔍 Validating ${files.length} file(s)...`);
    const validationErrors: string[] = [];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid && validation.error) {
        error(
          `[${requestId}] ❌ Validation failed for "${file.name}": ${validation.error}`
        );
        validationErrors.push(validation.error);
      } else {
        log(`[${requestId}] ✅ Validation passed for "${file.name}"`);
      }
    }

    if (validationErrors.length > 0) {
      error(`[${requestId}] ❌ File validation failed:`, validationErrors);
      return NextResponse.json(
        {
          success: false,
          message: "File validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    log(`[${requestId}] ✅ All files validated successfully`);

    // Upload files to S3 and save to database
    log(
      `[${requestId}] 🚀 Starting upload process for ${files.length} file(s)...`
    );
    const uploadedDocuments: Array<{
      id: string;
      name: string;
      originalName: string;
      type: string;
      size: number;
      s3Key: string;
      url?: string;
      createdAt: Date;
    }> = [];
    const uploadErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      log(
        `[${requestId}] 📁 Processing file ${i + 1}/${files.length}: "${
          file.name
        }"`
      );

      try {
        const s3Key = createS3Key(file, userId || undefined);
        const fileName = s3Key.split("/").pop() || file.name;

        log(`[${requestId}] 🔑 Generated S3 key: ${s3Key}`);

        // Upload to S3
        log(`[${requestId}] ⬆️  Uploading "${file.name}" to S3...`);
        await uploadToS3(s3Client, file, s3Key);
        log(`[${requestId}] ✅ S3 upload successful for "${file.name}"`);

        // Save to database
        log(`[${requestId}] 💾 Saving document metadata to database...`);
        const document = await saveDocumentToDatabase(
          fileName,
          file.name,
          file.size,
          file.type,
          s3Key,
          userId || undefined
        );
        log(
          `[${requestId}] ✅ Database save successful. Document ID: ${document.id}`
        );

        // Construct CDN URL if configured
        const cdnUrl = ENV.NEXT_PUBLIC_CDN_URL
          ? `${ENV.NEXT_PUBLIC_CDN_URL}/${s3Key}`
          : null;

        if (cdnUrl) {
          log(`[${requestId}] 🌐 CDN URL generated: ${cdnUrl}`);
        } else {
          warn(
            `[${requestId}] ⚠️  No CDN URL configured (NEXT_PUBLIC_CDN_URL not set)`
          );
        }

        uploadedDocuments.push({
          id: document.id,
          name: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          s3Key: s3Key,
          url: cdnUrl || undefined,
          createdAt: document.createdAt,
        });

        log(
          `[${requestId}] ✅ File "${file.name}" processed successfully (${
            i + 1
          }/${files.length})`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        uploadErrors.push(`Failed to upload "${file.name}": ${errorMessage}`);
        error(`[${requestId}] ❌ Error uploading file "${file.name}":`, err);
        error(`[${requestId}] 📋 Error details:`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          errorMessage,
        });
      }
    }

    // Check if any files were successfully uploaded
    if (uploadedDocuments.length === 0) {
      error(`[${requestId}] ❌ All files failed to upload`);
      error(`[${requestId}] 📋 Errors:`, uploadErrors);
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
      warn(
        `[${requestId}] ⚠️  Partial success: ${uploadedDocuments.length}/${files.length} files uploaded`
      );
      warn(`[${requestId}] 📋 Failed uploads:`, uploadErrors);
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
    log(
      `[${requestId}] 🎉 All ${uploadedDocuments.length} file(s) uploaded successfully`
    );
    log(`[${requestId}] 📊 Upload summary:`, {
      totalFiles: files.length,
      successfulUploads: uploadedDocuments.length,
      documentIds: uploadedDocuments.map((d) => d.id),
    });

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
  } catch (err) {
    error(`[${requestId}] ❌ Unexpected error in document upload:`, err);
    error(
      `[${requestId}] 📋 Error stack:`,
      err instanceof Error ? err.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during file upload",
        errors: [err instanceof Error ? err.message : "Unknown error"],
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
