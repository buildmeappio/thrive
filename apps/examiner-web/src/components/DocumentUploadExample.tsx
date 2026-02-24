'use client';
import React, { useState, useRef } from 'react';
import { documentService } from '@/server';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { UploadDocumentResponse } from '@/server/services/document.service';

/**
 * Example component demonstrating how to use the document upload API
 * This shows both single and multiple file uploads with progress tracking
 */
export default function DocumentUploadExample() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadDocumentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
      setError(null);
      setUploadResult(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadResult(null);

      // Upload files (you can pass userId if needed)
      const result = await documentService.uploadDocuments(files);

      if (result.success) {
        setUploadResult(result);
        setFiles([]); // Clear files on success
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800">Document Upload Example</h2>

      {/* File Input */}
      <div className="space-y-2">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
          Select Files
        </label>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500">
          Accepted: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, XLS, XLSX (Max 10MB per file)
        </p>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-3">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="w-full">
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </>
        )}
      </Button>

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 rounded-md bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">Upload Failed</h4>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            {uploadResult?.errors && (
              <ul className="mt-2 list-inside list-disc text-sm text-red-600">
                {uploadResult.errors.map((err: string, index: number) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadResult?.success && (
        <div className="space-y-3 rounded-md bg-green-50 p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800">Upload Successful</h4>
              <p className="mt-1 text-sm text-green-700">{uploadResult.message}</p>
            </div>
          </div>

          {/* Uploaded Documents */}
          {uploadResult.data?.documents && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-green-800">Uploaded Documents:</h5>
              <div className="space-y-2">
                {uploadResult.data.documents.map(doc => (
                  <div key={doc.id} className="rounded border border-green-200 bg-white p-3">
                    <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                    <p className="text-xs text-gray-500">ID: {doc.id}</p>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings for partial success */}
          {uploadResult.warnings && uploadResult.warnings.length > 0 && (
            <div className="mt-2 rounded border border-yellow-200 bg-yellow-50 p-3">
              <h5 className="text-sm font-medium text-yellow-800">Some files failed:</h5>
              <ul className="mt-1 list-inside list-disc text-sm text-yellow-700">
                {uploadResult.warnings.map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
