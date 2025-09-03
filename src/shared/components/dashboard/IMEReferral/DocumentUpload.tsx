'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import ProgressIndicator from './ProgressIndicator';
import BackButton from '../../ui/BackButton';
import ContinueButton from '../../ui/ContinueButton';

type DocumentUploadFormData = {
  files: FileList | null;
};

type DocumentUploadFormProps = {
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
};

const DocumentUpload: React.FC<DocumentUploadFormProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<DocumentUploadFormData>({
    defaultValues: {
      files: null,
    },
  });

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    setUploadedFiles(prev => [...prev, ...fileArray]);
    setValue('files', files);
    console.log('Files selected:', fileArray);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleFormSubmit = async (values: DocumentUploadFormData) => {
    console.log('Form Submitted:', { files: uploadedFiles, formValues: values });
    if (onNext) onNext();
  };

  const handleSaveDraft = async () => {
    const currentValues = { files: uploadedFiles };
    console.log('Saving draft:', currentValues);
    // Add your draft saving logic here
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="flex min-h-0 flex-col rounded-4xl bg-[#FFFFFF] p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-[36.02px]">
              Document Upload
            </h1>
          </div>

          {/* Upload Area */}
          <div className="relative flex flex-1 items-center justify-center px-2 sm:px-0">
            <div className="w-full max-w-[570px]">
              <div
                className={`relative h-48 w-full rounded-[10px] border-2 border-dashed opacity-100 transition-colors sm:h-56 md:h-[258.7415771484375px] ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-[#E4E4E42B]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {/* Cloud Upload Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform px-4">
                  <div className="mb-3 md:mb-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:h-14 sm:w-14 md:h-16 md:w-16">
                      <Upload className="h-6 w-6 text-gray-400 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                    </div>
                  </div>

                  {/* Upload Text */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-center text-sm text-gray-600 sm:text-base">
                      Drag & drop files or{' '}
                      <label className="cursor-pointer text-center font-medium text-[#000080] underline">
                        Browse
                        <input
                          {...register('files')}
                          type="file"
                          className="hidden"
                          onChange={handleFileInput}
                          accept=".jpeg,.jpg,.png,.gif,.mp4,.pdf,.psd,.ai,.doc,.ppt"
                          multiple
                        />
                      </label>
                    </p>
                  </div>

                  {/* Supported Formats */}
                  <p className="px-2 text-center text-xs text-gray-400 sm:text-sm">
                    <span className="hidden whitespace-nowrap sm:inline">
                      Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
                    </span>
                    <span className="sm:hidden">
                      Supported: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
                    </span>
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Uploaded Files:</h3>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
            />
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={handleSaveDraft}
                variant="outline"
                className="flex items-center justify-center space-x-2 rounded-3xl bg-[#0000BA] px-6 py-1 text-white"
              >
                <span>Save as Draft</span>
              </Button>
              <ContinueButton isLastStep={currentStep === totalSteps} color="#000080" />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default DocumentUpload;
