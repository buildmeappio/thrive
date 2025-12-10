"use client";
import { toast } from "sonner";
import Image from "next/image";

type DocumentPreviewModalProps = {
  previewUrl: string;
  previewFileName: string;
  previewFileType?: string; // Optional file type hint (pdf, jpg, jpeg, png)
  onClose: () => void;
};

export default function DocumentPreviewModal({
  previewUrl,
  previewFileName,
  previewFileType,
  onClose,
}: DocumentPreviewModalProps) {
  // Determine file type from URL extension or provided file type
  const getFileType = () => {
    if (previewFileType) {
      return previewFileType.toLowerCase();
    }
    // Try to extract from URL (for presigned URLs, this might not work)
    const urlMatch = previewUrl.toLowerCase().match(/\.(pdf|jpg|jpeg|png|gif|webp|bmp)$/i);
    return urlMatch ? urlMatch[1] : null;
  };

  const fileType = getFileType();
  const isImage = fileType && ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(fileType);
  const isPdf = fileType === "pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}>
      <div
        className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {previewFileName}
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="text-gray-600">
              <path
                fill="currentColor"
                d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 0 0 5.7 5.7L10.6 10.6 5.7 15.5a1 1 0 1 0 1.4 1.4L12 12.03l4.9 4.87a1 1 0 0 0 1.4-1.4l-4.9-4.87 4.9-4.93Z"
              />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="h-[calc(90vh-80px)] overflow-auto p-4">
          {isImage ? (
            <div className="relative w-full flex justify-center">
              <Image
                src={previewUrl}
                alt={previewFileName}
                width={0}
                height={0}
                sizes="100vw"
                className="max-w-full h-auto"
                unoptimized
                onError={() => {
                  toast.error("Failed to load image preview");
                  onClose();
                }}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={previewFileName}
              onError={() => {
                toast.error("Failed to load PDF preview");
                onClose();
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-600 mb-4">
                Preview not available for this file type.
              </p>
              <a
                href={previewUrl}
                download={previewFileName}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00A8FF] underline">
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

