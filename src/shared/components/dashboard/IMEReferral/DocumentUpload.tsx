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
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2 className="mb-6 text-[36.02px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:mb-8">
            Document Upload
          </h2>

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
            {errors.files && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.files.message}
              </p>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <ul className="mb-6 space-y-2">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-lg border bg-white px-4 py-2 shadow-sm"
                >
                  <span className="truncate text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFile(file)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-row justify-center gap-4 md:justify-between">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
            />

            <ContinueButton
              isLastStep={currentStep === totalSteps}
              color="#000080"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default DocumentUpload;
