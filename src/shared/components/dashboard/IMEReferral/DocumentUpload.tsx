'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import {
  DocumentUploadSchema,
  type DocumentUploadFormData,
} from '@/shared/validation/imeReferral/imeReferralValidation';
import { useIMEReferralStore } from '@/store/useIMEReferralStore';
import { DocumentUploadConfig } from '@/shared/config/documentUpload.config';
import ProgressIndicator from './ProgressIndicator';
import BackButton from '../../ui/BackButton';
import ContinueButton from '../../ui/ContinueButton';

interface DocumentUploadProps {
  onNext: () => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 1,
}) => {
  const { data, setData } = useIMEReferralStore();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(DocumentUploadSchema),
    defaultValues: data.step3 || { files: [] },
  });

  const files = watch('files');

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
    setData('step3', values);
    onNext();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="w-full max-w-full rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-full">
          <h2 className="mb-6 text-2xl leading-tight font-semibold tracking-[-0.02em] break-words text-[#000000] sm:text-3xl md:mb-8 md:text-[36.02px] md:leading-[36.02px]">
            Document Upload
          </h2>

          {/* Upload Box */}
          <div className="mb-6 flex w-full max-w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#F9FAFB] px-4 py-12 text-center sm:px-6">
            <Upload className="mb-3 h-12 w-12 flex-shrink-0 text-indigo-600" />
            <p className="px-2 font-medium break-words text-gray-700">
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
            <p className="mt-2 px-2 text-sm break-words text-gray-500">
              Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
            </p>
            {errors.files && (
              <p className="mt-2 px-2 text-sm break-words text-red-600" role="alert">
                {errors.files.message}
              </p>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-6 w-full max-w-full">
              <ul className="space-y-2">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex w-full max-w-full min-w-0 items-center justify-between rounded-lg border bg-white px-4 py-2 shadow-sm"
                  >
                    <span className="min-w-0 flex-1 truncate pr-2 text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      className="flex-shrink-0 text-red-500 hover:text-red-700"
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
          <div className="mt-8 flex justify-between px-4 md:mt-0 md:mb-0 md:px-0">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
            />

            <ContinueButton
              isSubmitting={false}
              isLastStep={currentStep === totalSteps}
              color="#000080"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;
