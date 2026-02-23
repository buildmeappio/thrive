import ErrorMessages from '@/constants/ErrorMessages';
import { DocumentUploadConfig } from '../config/documentUpload';

export const FileTypeCategories: Record<string, string[]> = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
  ],
  videos: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  documents: ['application/pdf', 'text/plain', 'text/csv'],
  design: ['application/vnd.adobe.photoshop', 'application/postscript'],
  office: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// File Size Formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// File Extension Utilities
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

export function isValidFileExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return DocumentUploadConfig.ALLOWED_FILE_EXTENSIONS.includes(extension as any);
}

// File Type Categorization
export function getFileTypeCategory(mimeType: string): string | null {
  for (const [category, types] of Object.entries(FileTypeCategories)) {
    if (types.includes(mimeType)) {
      return category;
    }
  }
  return null;
}

// Single File Validation
export function validateSingleFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Size validation
  if (file.size > DocumentUploadConfig.MAX_FILE_SIZE) {
    errors.push(
      `${file.name}: ${ErrorMessages.FILE_TOO_LARGE} ${formatFileSize(DocumentUploadConfig.MAX_FILE_SIZE)}`
    );
  }

  // Type validation
  if (!DocumentUploadConfig.ALLOWED_FILE_TYPES.includes(file.type as any)) {
    errors.push(`${file.name}: ${ErrorMessages.INVALID_FILE_TYPE} (${file.type})`);
  }

  // Extension validation (additional check)
  if (!isValidFileExtension(file.name)) {
    const extension = getFileExtension(file.name);
    warnings.push(`${file.name}: File extension '${extension}' might not be supported`);
  }

  // Filename length validation
  if (file.name.length > DocumentUploadConfig.MAX_FILENAME_LENGTH) {
    errors.push(`${file.name}: ${ErrorMessages.FILE_NAME_TOO_LONG}`);
  }

  // Empty file validation
  if (file.size === 0) {
    errors.push(`${file.name}: ${ErrorMessages.FILE_CORRUPTED}`);
  }

  // Large file warning (not error, but heads up)
  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    warnings.push(
      `${file.name}: Large file size (${formatFileSize(file.size)}) - upload may take longer`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Multiple Files Validation
export function validateFileArray(files: File[]): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Count validation
  if (files.length === 0) {
    errors.push(ErrorMessages.DOCUMENT_UPLOAD_REQUIRED);
  }

  if (files.length > DocumentUploadConfig.MAX_FILES_COUNT) {
    errors.push(
      `${ErrorMessages.TOO_MANY_FILES} (maximum ${DocumentUploadConfig.MAX_FILES_COUNT} files allowed)`
    );
  }

  // Duplicate validation
  const seen = new Map<string, number>();
  files.forEach((file, index) => {
    const key = `${file.name}-${file.size}`;
    if (seen.has(key)) {
      const previousPosition = seen.get(key);
      if (previousPosition !== undefined) {
        errors.push(
          `${ErrorMessages.DUPLICATE_FILE}: ${file.name} (positions ${previousPosition + 1} and ${index + 1})`
        );
      }
    } else {
      seen.set(key, index);
    }
  });

  // Validate individual files
  files.forEach(file => {
    const result = validateSingleFile(file);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  });

  // Total size warning
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 100 * 1024 * 1024) {
    // 100MB total
    warnings.push(`Total upload size is ${formatFileSize(totalSize)} - this may take a while`);
  }

  return {
    isValid: errors.length === 0,
    errors: [...new Set(errors)], // Remove duplicates
    warnings: [...new Set(warnings)], // Remove duplicates
  };
}

// Pre-validation for FileList (before converting to File[])
export function preValidateFileList(fileList: FileList): FileValidationResult {
  const files = Array.from(fileList);
  return validateFileArray(files);
}

// Duplicate Detection Utility
export function findDuplicateFiles(files: File[]): { file: File; duplicateIndexes: number[] }[] {
  const duplicates: { file: File; duplicateIndexes: number[] }[] = [];
  const seen = new Map<string, number[]>();

  files.forEach((file, index) => {
    const key = `${file.name}-${file.size}`;
    if (seen.has(key)) {
      const existing = seen.get(key);
      if (existing) {
        existing.push(index);
      }
    } else {
      seen.set(key, [index]);
    }
  });

  seen.forEach(indexes => {
    if (indexes.length > 1) {
      duplicates.push({
        file: files[indexes[0]],
        duplicateIndexes: indexes,
      });
    }
  });

  return duplicates;
}

// Remove Duplicates Utility
export function removeDuplicateFiles(files: File[]): File[] {
  const seen = new Set<string>();
  return files.filter(file => {
    const key = `${file.name}-${file.size}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// UI Helper Functions
export function getSupportedFileTypesString(short: boolean = false): string {
  if (short) {
    return 'JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT, Excel';
  }

  const categories = [
    'Images (JPEG, PNG, GIF, WebP, BMP, TIFF)',
    'Videos (MP4, AVI, MOV, WMV)',
    'Documents (PDF, TXT, CSV)',
    'Design Files (PSD, AI, EPS)',
    'Office Files (Word, Excel, PowerPoint)',
  ];
  return categories.join(', ');
}

export function getFileInputAcceptString(): string {
  return DocumentUploadConfig.ALLOWED_FILE_EXTENSIONS.join(',');
}

// File Info Extraction
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    type: file.type,
    category: getFileTypeCategory(file.type),
    extension: getFileExtension(file.name),
    lastModified: new Date(file.lastModified),
  };
}

// Validation Summary
export function getValidationSummary(files: File[]): {
  totalFiles: number;
  totalSize: string;
  validFiles: number;
  invalidFiles: number;
  categories: Record<string, number>;
} {
  // commented because of error "validation is assigned a value but never used"
  // const validation = validateFileArray(files);
  const validFiles = files.filter(file => validateSingleFile(file).isValid);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const categories: Record<string, number> = {};
  files.forEach(file => {
    const category = getFileTypeCategory(file.type) || 'unknown';
    categories[category] = (categories[category] || 0) + 1;
  });

  return {
    totalFiles: files.length,
    totalSize: formatFileSize(totalSize),
    validFiles: validFiles.length,
    invalidFiles: files.length - validFiles.length,
    categories,
  };
}
