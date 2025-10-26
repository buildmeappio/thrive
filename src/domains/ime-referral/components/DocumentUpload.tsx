'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, FileText, Loader2, Download, Eye } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import { useIMEReferralStore } from '@/store/useImeReferral';
import { DocumentUploadConfig } from '@/config/documentUpload';
import BackButton from '@/components/BackButton';
import ContinueButton from '@/components/ContinueButton';
import { type DocumentUploadFormData, DocumentUploadSchema } from '../schemas/imeReferral';
import { getCaseData } from '../server/handlers';
import { getPresignedUrlFromS3 } from '@/lib/s3-actions';
import Link from 'next/link';
import log from '@/utils/log';

interface DocumentUploadProps {
  onNext: () => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
  documentData?: Awaited<ReturnType<typeof getCaseData>>['result']['step6'];
  mode?: 'create' | 'edit';
}

interface ExistingDocument {
  displayName: string;
  s3Key: string;
  url: string;
  error?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 1,
  documentData,
  mode,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();
  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [deletedDocuments, setDeletedDocuments] = useState<string[]>([]);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [initialExistingCount, setInitialExistingCount] = useState(0);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    clearErrors,
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(DocumentUploadSchema),
    defaultValues: {
      files: data.step6?.files || [],
      deletedDocuments: [],
      existingDocumentsCount: 0,
    },
  });

  const files = watch('files');

  // Load existing documents from database
  useEffect(() => {
    const loadExistingDocuments = async () => {
      if (!documentData?.document || documentData.document.length === 0) {
        setValue('existingDocumentsCount', 0);
        setInitialExistingCount(0);
        return;
      }

      setLoadingDocs(true);
      setUrlError(null);

      try {
        const docsWithUrls = await Promise.all(
          documentData.document.map(async doc => {
            try {
              const result = await getPresignedUrlFromS3(doc.document.name);

              if (!result.success) {
                log.error('Failed to get URL for:', doc.document.name, 'Error:', result.error);
              }

              return {
                displayName: doc.document.displayName || doc.document.name || '',
                s3Key: doc.document.name || '',
                url: result.success ? result.url : '',
                error: result.success ? undefined : result.error,
              };
            } catch (error) {
              log.error(`Exception loading document ${doc.document.name}:`, error);
              return {
                displayName: doc.document.displayName || doc.document.name || '',
                s3Key: doc.document.name || '',
                url: '',
                error: 'Failed to load document',
              };
            }
          })
        );

        setExistingDocuments(docsWithUrls);
        setInitialExistingCount(docsWithUrls.length);
        setValue('existingDocumentsCount', docsWithUrls.length);

        // Check if any documents failed to load
        const failedDocs = docsWithUrls.filter(doc => doc.error);
        if (failedDocs.length > 0) {
          log.error('📋 Failed documents:', failedDocs);
          const errorMessages = failedDocs
            .map(doc => `${doc.displayName}: ${doc.error}`)
            .join(', ');
          setUrlError(`${failedDocs.length} document(s) could not be loaded. ${errorMessages}`);
        }
      } catch (error) {
        log.error('Error loading documents:', error);
        setUrlError('Failed to load existing documents');
      } finally {
        setLoadingDocs(false);
      }
    };

    loadExistingDocuments();
  }, [documentData, setValue]);

  // Update deletedDocuments
  useEffect(() => {
    if (loadingDocs) return;

    setValue('deletedDocuments', deletedDocuments);
    const validateDocuments = async () => {
      const isValid = await trigger();
      if (isValid) {
        clearErrors('files');
      }
    };
    validateDocuments();
  }, [deletedDocuments, setValue, trigger, clearErrors, loadingDocs]);

  // Refresh presigned URLs (they expire after 1 hour by default)
  const refreshDocumentUrl = async (s3Key: string) => {
    try {
      const result = await getPresignedUrlFromS3(s3Key);
      if (result.success) {
        setExistingDocuments(prev =>
          prev.map(doc =>
            doc.s3Key === s3Key ? { ...doc, url: result.url, error: undefined } : doc
          )
        );
      }
    } catch (error) {
      log.error('Error refreshing URL:', error);
    }
  };

  // Handle deleting existing document
  const handleDeleteExistingDocument = async (s3Key: string) => {
    setDeletingDoc(s3Key);

    try {
      setDeletedDocuments(prev => [...prev, s3Key]);
      setExistingDocuments(prev => prev.filter(doc => doc.s3Key !== s3Key));
    } catch (error) {
      log.error('Error marking document for deletion:', error);
    } finally {
      setDeletingDoc(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    setValue('files', [...files, ...newFiles], { shouldValidate: true });
  };

  const handleRemoveFile = (file: File) => {
    setValue(
      'files',
      files.filter(f => f !== file),
      { shouldValidate: true }
    );
  };

  const onSubmit = (values: DocumentUploadFormData) => {
    setData('step6', {
      ...values,
      deletedDocuments,
    });
    onNext();
  };

  if (!_hasHydrated) {
    return null;
  }

  return (
    <>
      <h1 className="mb-6 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        {mode === 'edit' ? 'Edit Case Request' : 'New Case Request'}
      </h1>
      <ProgressIndicator mode={mode} currentStep={currentStep} totalSteps={totalSteps} />
      <div
        style={{ minHeight: '530px' }}
        className="rounded-4xl bg-white p-4 sm:p-6 md:px-[55px] md:py-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2 className="mb-6 text-[24px] leading-[36.02px] font-semibold tracking-[-0.02em] md:text-[36.02px]">
            Document Upload
          </h2>

          {/* Loading State */}
          {loadingDocs && (
            <div className="mb-6 flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading existing documents...</span>
            </div>
          )}

          {/* Existing Documents from Database */}
          {existingDocuments.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">
                Existing Documents ({existingDocuments.length})
              </h3>
              <ul className="space-y-2">
                {existingDocuments.map((doc, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 shadow-sm ${
                      doc.error ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText
                        className={`h-5 w-5 ${doc.error ? 'text-red-600' : 'text-blue-600'}`}
                      />
                      {/* Display the user-friendly name */}
                      <span className="truncate text-gray-700">{doc.displayName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.error ? (
                        <button
                          type="button"
                          onClick={() => refreshDocumentUrl(doc.s3Key)}
                          className="text-sm text-red-600 hover:text-red-800 hover:underline"
                        >
                          Retry
                        </button>
                      ) : (
                        <>
                          <Link
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                          <a
                            href={doc.url}
                            download={doc.displayName}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingDocument(doc.s3Key)}
                        disabled={deletingDoc === doc.s3Key}
                        className="ml-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                        aria-label={`Delete ${doc.displayName}`}
                      >
                        {deletingDoc === doc.s3Key ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Box */}
          <div className="mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#F9FAFB] px-6 py-12 text-center">
            <Upload className="mb-3 h-12 w-12 text-indigo-600" />
            <p className="font-medium text-gray-700">
              Drag & drop files or{' '}
              <label htmlFor="fileUpload" className="cursor-pointer text-indigo-600 underline">
                Browse
              </label>
            </p>
            <input
              id="fileUpload"
              type="file"
              multiple
              accept={DocumentUploadConfig.ALLOWED_FILE_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-sm text-gray-500">
              Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
            </p>
            {errors.files && <p className="mt-2 text-sm text-red-600">{errors.files.message}</p>}
          </div>

          {/* Newly Selected Files */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">
                New Files to Upload ({files.length})
              </h3>
              <ul className="space-y-2">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-gray-700">{file.name}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveFile(file)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-24 flex flex-row justify-between gap-4 px-4 md:px-0">
            <BackButton
              isSubmitting={isSubmitting || loadingDocs}
              onClick={onPrevious}
              disabled={currentStep === 1 || loadingDocs}
              borderColor="#000080"
              iconColor="#000080"
            />

            <ContinueButton
              isSubmitting={isSubmitting || loadingDocs}
              isLastStep={currentStep === totalSteps}
              color="#000080"
              disabled={isSubmitting || loadingDocs}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default DocumentUpload;
