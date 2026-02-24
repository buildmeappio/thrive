import { toast } from 'sonner';
import Image from 'next/image';

type DocumentPreviewModalProps = {
  previewUrl: string;
  previewFileName: string;
  onClose: () => void;
};

export default function DocumentPreviewModal({
  previewUrl,
  previewFileName,
  onClose,
}: DocumentPreviewModalProps) {
  const isImage = previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
  const isPdf = previewUrl.toLowerCase().match(/\.(pdf)$/i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="font-poppins truncate pr-4 text-lg font-semibold text-gray-900">
            {previewFileName}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-600">
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
            <div className="relative flex w-full justify-center">
              <Image
                src={previewUrl}
                alt={previewFileName}
                width={0}
                height={0}
                sizes="100vw"
                className="h-auto max-w-full"
                unoptimized
                onError={() => {
                  toast.error('Failed to load image preview');
                  onClose();
                }}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0`}
              className="h-full min-h-[600px] w-full border-0"
              title={previewFileName}
              onError={() => {
                toast.error('Failed to load PDF preview');
                onClose();
              }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-poppins mb-4 text-gray-600">
                Preview not available for this file type.
              </p>
              <a
                href={previewUrl}
                download={previewFileName}
                target="_blank"
                rel="noopener noreferrer"
                className="font-poppins text-[#000080] underline"
              >
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
