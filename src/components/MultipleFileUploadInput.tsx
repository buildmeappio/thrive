"use client";
import React, { useRef, useState } from "react";
import { Upload, File, X, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { log } from "@/utils/logger";
import { ExistingDocument, DocumentFile } from "./FileUploadInput";
import { getExaminerDocumentPresignedUrlAction } from "@/domains/auth/server/actions/getExaminerDocumentPresignedUrl";

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
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const processFiles = (filesArray: File[]) => {
    setSizeError(null);
    const currentFiles = value || [];

    // Check max files limit
    if (maxFiles && currentFiles.length + filesArray.length > maxFiles) {
      setSizeError(`Maximum ${maxFiles} file(s) allowed`);
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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const filesArray = Array.from(selectedFiles);
    processFiles(filesArray);

    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleRemoveFile = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    const newFiles = (value || []).filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const handlePreviewExisting =
    (file: DocumentFile) => async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (file && "isExisting" in file && file.isExisting) {
        try {
          log("Preview existing document:", file.id);

          // Get presigned URL from S3
          const result = await getExaminerDocumentPresignedUrlAction(file.name);

          if (result.success && result.url) {
            // Open the document in a new tab
            window.open(result.url, "_blank");
          } else {
            console.error("Failed to get presigned URL:", result.error);
            alert("Failed to preview document. Please try again.");
          }
        } catch (error) {
          console.error("Error previewing document:", error);
          alert("Failed to preview document. Please try again.");
        }
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

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm text-black">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Upload Button with Drag and Drop */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "mt-2 flex h-[120px] w-full cursor-pointer items-center justify-center rounded-[10px] border-2 border-dashed px-3 text-sm transition-all flex-col gap-2",
          isDragging
            ? "border-[#00A8FF] bg-[#E6F4FF]"
            : "border-[#D1D5DB] bg-[#F2F5F6]",
          "hover:border-[#00A8FF] hover:bg-[#E8EBEC] focus-within:ring-2 focus-within:ring-[#00A8FF]/30 focus-within:ring-offset-0",
          disabled && "cursor-not-allowed opacity-50",
          error && "ring-2 ring-red-500/30 border-red-300"
        )}>
        {showIcon && (
          <div className="flex items-center justify-center">
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-[#00A8FF]" : "text-[#A4A4A4]"
              )}
              strokeWidth={2}
            />
          </div>
        )}

        <div className="flex items-center justify-center">
          <span
            className={cn(
              "text-[14px] font-normal transition-colors text-center",
              isDragging
                ? "text-[#00A8FF]"
                : hasFiles
                ? "text-[#333]"
                : "text-[#9EA9AA]"
            )}>
            {isDragging
              ? "Drop files here"
              : hasFiles
              ? `${files.length} file(s) selected`
              : `${placeholder} or drag and drop`}
          </span>
        </div>
      </div>

      {/* Files List */}
      {hasFiles && (
        <div className="mt-2 space-y-2">
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
                    onClick={handlePreviewExisting(file)}
                    className="p-1.5 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
                    disabled={disabled}
                    title="Preview document">
                    <Eye className="h-4 w-4" />
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

      {(() => {
        const errorToShow = error || sizeError;
        if (!errorToShow) return null;

        // Only show error message for validation errors, not simple "required" errors
        const isRequiredError =
          error &&
          (error.toLowerCase() === "required" ||
            error.toLowerCase().endsWith(" is required") ||
            error.toLowerCase() === "is required");

        // Always show sizeError (it's a validation error)
        // Only show error if it's not a required error
        if (sizeError) {
          return <p className="text-xs text-red-500 mt-1">{sizeError}</p>;
        }
        if (error && !isRequiredError) {
          return <p className="text-xs text-red-500 mt-1">{error}</p>;
        }
        return null;
      })()}

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
