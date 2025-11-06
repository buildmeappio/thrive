"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Interpreter</h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">{interpreterName}</span>?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone. All data associated with this interpreter will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={cn(
              "px-4 py-2 rounded-full border border-gray-300 text-gray-700",
              "hover:bg-gray-50 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              "px-4 py-2 rounded-full bg-red-600 text-white",
              "hover:bg-red-700 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

