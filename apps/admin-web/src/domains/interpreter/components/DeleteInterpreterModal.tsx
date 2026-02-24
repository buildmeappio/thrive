'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  interpreterName: string;
};

export default function DeleteInterpreterModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  interpreterName,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Delete Interpreter</h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-2 text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">{interpreterName}</span>?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone. All data associated with this interpreter will be
            permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={cn(
              'rounded-full border border-gray-300 px-4 py-2 text-gray-700',
              'transition-colors hover:bg-gray-50',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              'rounded-full bg-red-600 px-4 py-2 text-white',
              'transition-colors hover:bg-red-700',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
