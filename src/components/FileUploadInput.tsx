"use client";
import React, { useRef } from "react";
import { Upload, File, X, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Document types for handling both new uploads and existing documents
export type ExistingDocument = {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  size: number;
  isExisting: true;
};

export type DocumentFile = File | ExistingDocument | null;

interface FileUploadInputProps {
  name: string;
  label?: string;
  value?: DocumentFile;
  onChange: (file: DocumentFile) => void;
  accept?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showIcon?: boolean;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({
  name,
  label,
  value,
  onChange,
  accept = ".pdf,.doc,.docx",
  required = false,
  error,
  placeholder = "Click to upload file",
  disabled = false,
  className,
  showIcon = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemoveFile = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadExisting = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (value && "isExisting" in value && value.isExisting) {
      // TODO: Implement download functionality for existing documents
      console.log("Download existing document:", value.id);
    }
  };

  const isExistingDocument = (doc: DocumentFile): doc is ExistingDocument => {
    return (
      doc !== null &&
      typeof doc === "object" &&
      "isExisting" in doc &&
      doc.isExisting === true
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm text-black">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div
        onClick={handleClick}
        className={cn(
          "mt-2 flex h-[55px] w-full cursor-pointer items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm transition-all",
          "hover:bg-[#E8EBEC] focus-within:ring-2 focus-within:ring-[#00A8FF]/30 focus-within:ring-offset-0",
          disabled && "cursor-not-allowed opacity-50",
          error && "ring-2 ring-red-500/30"
        )}>
        {!value && showIcon && (
          <Upload
            className="mr-3 h-5 w-5 text-[#A4A4A4] flex-shrink-0"
            strokeWidth={2}
          />
        )}

        <div className="flex-1 flex items-center justify-between min-w-0">
          {value ? (
            <div className="flex items-center min-w-0 flex-1">
              {showIcon && (
                <File className="mr-3 h-5 w-5 text-[#00A8FF] flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[#333] text-[13px] font-medium truncate">
                  {isExistingDocument(value)
                    ? value.displayName || value.name
                    : value.name}
                </p>
                <p className="text-[11px] text-[#9EA9AA]">
                  {formatFileSize(value.size)}
                  {isExistingDocument(value) && (
                    <span className="ml-2 text-[#00A8FF] text-[10px]">
                      (Previously uploaded)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-[14px] font-normal text-[#9EA9AA]">
              {placeholder}
            </span>
          )}

          {value && (
            <div className="flex items-center gap-1 ml-2">
              {isExistingDocument(value) && (
                <button
                  type="button"
                  onClick={handleDownloadExisting}
                  className="p-1 rounded-full hover:bg-blue-100 text-blue-500 transition-colors flex-shrink-0"
                  disabled={disabled}
                  title="Download existing document">
                  <Download className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors flex-shrink-0"
                disabled={disabled}
                title={
                  isExistingDocument(value)
                    ? "Remove and upload new file"
                    : "Remove file"
                }>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        aria-label={label}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {accept && !error && (
        <p className="text-xs text-[#9EA9AA] mt-1">
          Accepted formats: {accept.replace(/\./g, "").toUpperCase()}
        </p>
      )}
    </div>
  );
};

export default FileUploadInput;
