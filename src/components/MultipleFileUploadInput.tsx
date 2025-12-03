"use client";
import React, { useRef, useState } from "react";
import { Upload, File, X, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { log } from "@/utils/logger";
import { ExistingDocument, DocumentFile } from "./FileUploadInput";

interface MultipleFileUploadInputProps {
  name: string;
  label?: string;
  value?: DocumentFile[];
  onChange: (files: DocumentFile[]) => void;
  accept?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showIcon?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number; // maximum number of files allowed
}

const MultipleFileUploadInput: React.FC<MultipleFileUploadInputProps> = ({
  name,
  label,
  value = [],
  onChange,
  accept = ".pdf,.doc,.docx",
  required = false,
  error,
  placeholder = "Click to upload files",
  disabled = false,
  className,
  showIcon = true,
  maxSize = 10 * 1024 * 1024, // Default 10MB
  maxFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    setSizeError(null);

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const filesArray = Array.from(selectedFiles);
    const currentFiles = value || [];

    // Check max files limit
    if (maxFiles && currentFiles.length + filesArray.length > maxFiles) {
      setSizeError(`Maximum ${maxFiles} file(s) allowed`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file sizes and types
    const validFiles: File[] = [];
    const errors: string[] = [];

    filesArray.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(
          `${file.name}: File size exceeds maximum of ${formatFileSize(
            maxSize
          )}`
        );
      } else {
        // Check file type
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
          errors.push(
            `${file.name}: Invalid file type. Only PDF, DOC, and DOCX are allowed.`
          );
        } else {
          validFiles.push(file);
        }
      }
    });

    if (errors.length > 0) {
      setSizeError(errors.join("; "));
    }

    if (validFiles.length > 0) {
      onChange([...currentFiles, ...validFiles]);
    }

    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    const newFiles = (value || []).filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const handleDownloadExisting =
    (file: DocumentFile) => (event: React.MouseEvent) => {
      event.stopPropagation();
      if (file && "isExisting" in file && file.isExisting) {
        // TODO: Implement download functionality for existing documents
        log("Download existing document:", file.id);
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

  const files = value || [];
  const hasFiles = files.length > 0;
  // Each file item is approximately 75px tall (including padding and spacing)
  // Show only 2 files visible, rest will scroll
  // 2 files = ~75px * 2 + 8px gap = ~158px
  const maxVisibleHeight = 158; // Height for exactly 2 files
  const needsScrolling = files.length > 2;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm text-black">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Upload Button */}
      <div
        onClick={handleClick}
        className={cn(
          "mt-2 flex h-[55px] w-full cursor-pointer items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm transition-all",
          "hover:bg-[#E8EBEC] focus-within:ring-2 focus-within:ring-[#00A8FF]/30 focus-within:ring-offset-0",
          disabled && "cursor-not-allowed opacity-50",
          error && "ring-2 ring-red-500/30"
        )}>
        {showIcon && (
          <Upload
            className="mr-3 h-5 w-5 text-[#A4A4A4] flex-shrink-0"
            strokeWidth={2}
          />
        )}

        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-[14px] font-normal text-[#9EA9AA]">
            {hasFiles ? `${files.length} file(s) selected` : placeholder}
          </span>
        </div>
      </div>

      {/* Files List */}
      {hasFiles && (
        <div
          className="mt-2"
          style={{
            maxHeight: `${maxVisibleHeight}px`,
            overflow: "hidden",
            height: needsScrolling ? `${maxVisibleHeight}px` : "auto",
          }}>
          <div
            className="overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin"
            style={{
              height: needsScrolling ? "100%" : "auto",
              maxHeight: `${maxVisibleHeight}px`,
            }}>
            <div className="space-y-2">
              {files.map((file: DocumentFile, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-[10px] bg-[#F8F9FA] border border-[#E8EBEC] p-2 transition-all hover:bg-[#F2F5F6] flex-shrink-0">
                  <File className="h-5 w-5 text-[#00A8FF] flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#333] truncate">
                      {isExistingDocument(file)
                        ? file?.displayName || file?.name || ""
                        : file?.name || ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] text-[#9EA9AA]">
                        {formatFileSize(file?.size || 0)}
                      </p>
                      {isExistingDocument(file) && (
                        <span className="text-[10px] text-[#00A8FF] bg-[#E6F4FF] px-2 py-0.5 rounded">
                          Previously uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isExistingDocument(file) && (
                      <button
                        type="button"
                        onClick={handleDownloadExisting(file)}
                        className="p-1.5 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
                        disabled={disabled}
                        title="Download existing document">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile(index)}
                      className="p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                      disabled={disabled}
                      title={
                        isExistingDocument(file)
                          ? "Remove and upload new file"
                          : "Remove file"
                      }>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        aria-label={label}
      />

      {(error || sizeError) && (
        <p className="text-xs text-red-500 mt-1">{error || sizeError}</p>
      )}

      {accept && !error && !sizeError && (
        <p className="text-xs text-[#9EA9AA] mt-1">
          Accepted formats: {accept.replace(/\./g, "").toUpperCase()} • Max
          size: {formatFileSize(maxSize)} per file
          {maxFiles && ` • Max files: ${maxFiles}`}
        </p>
      )}
    </div>
  );
};

export default MultipleFileUploadInput;
