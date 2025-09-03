"use client"
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const DocumentUpload = () => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload here
      console.log(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file upload here
      console.log(e.target.files);
    }
  };

  return (
    <div className="rounded-4xl bg-[#FFFFFF] p-4 sm:p-6 md:p-10 flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl md:text-[36.02px] font-bold text-gray-900">Document Upload</h1>
      </div>

      {/* Upload Area */}
      <div className="relative flex-1 flex items-center justify-center px-2 sm:px-0">
        <div
          className={`w-full max-w-[570px] h-48 sm:h-56 md:h-[258.7415771484375px] relative rounded-[10px] border-dashed border-2 transition-colors opacity-100 ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-[#E4E4E42B]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Cloud Upload Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="mb-3 md:mb-4">
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gray-100">
                <Upload className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-400" />
              </div>
            </div>

            {/* Upload Text */}
            <div className="mb-3 md:mb-4">
              <p className="text-center text-sm sm:text-base text-gray-600">
                Drag & drop files or{' '}
                <label className="cursor-pointer font-medium text-center text-[#000080] underline">
                  Browse
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".jpeg,.jpg,.png,.gif,.mp4,.pdf,.psd,.ai,.doc,.ppt"
                  />
                </label>
              </p>
            </div>

            {/* Supported Formats */}
            <p className="text-xs sm:text-sm text-gray-400 text-center px-2">
              <span className="hidden sm:inline whitespace-nowrap">Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT</span>
              <span className="sm:hidden">Supported: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 md:mt-8">
        <Button variant="outline" className="flex items-center justify-center rounded-3xl border-[#000080] px-6 sm:px-10 py-1 text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Button>
        <Button className="flex items-center justify-center rounded-full bg-[#000080] px-6 sm:px-10 py-2 text-white hover:bg-blue-700 w-full sm:w-auto">
          Continue
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;