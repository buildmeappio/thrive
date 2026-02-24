'use client';

import { useState } from 'react';

type FieldRowProps = {
  label: string;
  value: React.ReactNode;
  valueHref?: string;
  type: 'text' | 'document' | 'link';
  documentUrl?: string; // Add presigned URL support for documents
};

const FieldRow = ({ label, value, valueHref, type, documentUrl }: FieldRowProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileName = typeof value === 'string' ? value : '';
  // Use presigned URL if provided, otherwise fall back to old URL format
  const fileUrl =
    documentUrl ||
    `https://public-thrive-assets.s3.eu-north-1.amazonaws.com/documents/${encodeURIComponent(
      fileName
    )}`;

  return (
    <>
      <div className="flex w-full flex-col justify-between gap-1.5 rounded-lg bg-[#F6F6F6] px-3 py-2 sm:flex-row sm:items-center sm:gap-2 sm:px-4">
        <span className="min-w-0 flex-1 truncate pr-2 font-[Poppins] text-[14px] font-[400] leading-tight tracking-[-0.03em] text-[#4E4E4E] sm:text-[16px]">
          {label.includes('*') ? (
            <>
              {label.replace('*', '')}
              <span className="text-red-500">*</span>
            </>
          ) : (
            label
          )}
        </span>

        <div className="flex-shrink-0 text-left sm:text-right">
          {type === 'link' ? (
            <a
              href={valueHref}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words font-[Poppins] text-[14px] font-[400] leading-tight tracking-[-0.03em] text-[#000080] underline sm:text-[16px]"
            >
              {value as string}
            </a>
          ) : type === 'document' ? (
            fileName ? (
              <div className="flex items-center justify-start gap-3 sm:justify-end">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="font-[Poppins] text-[14px] font-[400] leading-tight text-[#4E4E4E] underline sm:text-[16px]"
                >
                  Preview
                </button>
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[Poppins] text-[14px] font-[400] leading-tight text-[#000080] underline sm:text-[16px]"
                >
                  Download
                </a>
              </div>
            ) : (
              <span className="block font-[Poppins] text-[14px] font-[400] leading-tight tracking-[-0.03em] text-[#000080] sm:text-[16px]">
                -
              </span>
            )
          ) : (
            <span className="block break-words font-[Poppins] text-[14px] font-[400] leading-tight tracking-[-0.03em] text-[#000080] sm:text-[16px]">
              {value ?? '-'}
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="flex-1 truncate pr-4 text-lg font-semibold text-gray-900">
                {fileName}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Download
                </a>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
              <iframe src={fileUrl} title="Document Preview" className="h-full w-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FieldRow;
