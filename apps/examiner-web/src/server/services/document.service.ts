/**
 * Document Service
 * Handles document/image uploads to S3 via API
 */

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data?: {
    documents: Array<{
      id: string;
      name: string;
      originalName: string;
      size: number;
      type: string;
      s3Key: string;
      url: string | null;
      createdAt: Date;
    }>;
    totalUploaded: number;
    totalFailed?: number;
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Upload one or multiple documents/images to S3
 *
 * @param files - Single file or array of files to upload
 * @param userId - Optional user ID to organize files in S3
 * @returns Promise with upload result
 *
 * @example
 * // Upload single file
 * const result = await uploadDocuments(file, "user-123");
 *
 * @example
 * // Upload multiple files
 * const result = await uploadDocuments([file1, file2], "user-123");
 */
export async function uploadDocuments(
  files: File | File[],
  userId?: string
): Promise<UploadDocumentResponse> {
  try {
    const formData = new FormData();

    // Add files to form data
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach(file => {
      formData.append('files', file);
    });

    // Add userId if provided
    if (userId) {
      formData.append('userId', userId);
    }

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const result: UploadDocumentResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to upload documents',
        errors: result.errors || ['Unknown error occurred'],
      };
    }

    return result;
  } catch (error) {
    console.error('Error uploading documents:', error);
    return {
      success: false,
      message: 'Network error during file upload',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Get upload API information
 */
export async function getUploadInfo() {
  try {
    const response = await fetch('/api/documents/upload', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upload info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching upload info:', error);
    throw error;
  }
}
