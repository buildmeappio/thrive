import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import { uploadFilesToS3, type UploadedFile } from '@/lib/s3-actions';

export interface CreateDocumentInput {
  name: string;
  type: string;
  size: number;
  caseId?: string;
}

export interface UploadAndCreateDocumentInput {
  files: File[];
  caseId?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentWithOriginalName extends Document {
  originalName: string;
}

export interface DocumentUploadResult {
  success: boolean;
  documents: DocumentWithOriginalName[];
  uploadedFiles: UploadedFile[];
  error?: string;
}

export class DocumentService {
  /**
   * Upload files to S3 and create document records
   */
  static async uploadAndCreateDocuments(
    input: UploadAndCreateDocumentInput
  ): Promise<DocumentUploadResult> {
    if (!input.files || input.files.length === 0) {
      return {
        success: false,
        documents: [],
        uploadedFiles: [],
        error: 'No files provided',
      };
    }

    try {
      // Create FormData for S3 upload
      const uploadFormData = new FormData();
      input.files.forEach(file => {
        uploadFormData.append('files', file);
      });

      // Upload to S3
      const uploadResult = await uploadFilesToS3(uploadFormData);

      if (uploadResult.error) {
        return {
          success: false,
          documents: [],
          uploadedFiles: [],
          error: uploadResult.error,
        };
      }

      if (!uploadResult.success || !uploadResult.files) {
        return {
          success: false,
          documents: [],
          uploadedFiles: [],
          error: 'Upload failed - no files returned',
        };
      }

      // Create document records in database
      const createdDocuments = await prisma.$transaction(async tx => {
        const documents = await Promise.all(
          uploadResult.files!.map(async file => {
            const document = await tx.documents.create({
              data: {
                name: file.name, // Store the unique S3 filename
                type: file.type,
                size: file.size,
              },
            });

            // If caseId provided, create the case-document relationship
            if (input.caseId) {
              await tx.caseDocument.create({
                data: {
                  caseId: input.caseId,
                  documentId: document.id,
                },
              });
            }

            return {
              ...document,
              originalName: file.originalName, // Include for frontend display
            };
          })
        );

        return documents;
      });

      return {
        success: true,
        documents: createdDocuments,
        uploadedFiles: uploadResult.files,
      };
    } catch (error) {
      console.error('Error in uploadAndCreateDocuments:', error);
      return {
        success: false,
        documents: [],
        uploadedFiles: [],
        error: error instanceof Error ? error.message : 'Failed to upload and create documents',
      };
    }
  }

  /**
   * Create a document record (without S3 upload)
   */
  static async createDocument(input: CreateDocumentInput): Promise<Document> {
    try {
      const document = await prisma.documents.create({
        data: {
          name: input.name, // The S3 filename
          type: input.type,
          size: input.size,
        },
      });

      // If caseId provided, create the case-document relationship
      if (input.caseId) {
        await prisma.caseDocument.create({
          data: {
            caseId: input.caseId,
            documentId: document.id,
          },
        });
      }

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw HttpError.handleServiceError(error, 'Failed to create document record');
    }
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id: string): Promise<Document | null> {
    try {
      const document = await prisma.documents.findUnique({
        where: { id },
      });

      return document;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw HttpError.handleServiceError(error, 'Failed to fetch document');
    }
  }
}
