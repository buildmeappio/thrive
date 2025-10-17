"use client";
import React, { useState, useRef } from "react";
import { User, Camera, Loader2 } from "lucide-react";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoChange?: (file: File | null) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * ProfilePhotoUpload Component
 *
 * Allows users to upload and preview their profile photo
 * Supports drag & drop, click to upload, and remove functionality
 */
const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange,
  disabled = false,
  size = "md",
}) => {
  // Only set preview if currentPhotoUrl is a valid string
  const [preview, setPreview] = useState<string | null>(
    currentPhotoUrl && currentPhotoUrl.trim() !== "" ? currentPhotoUrl : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add image load error handler
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Please upload a valid image (JPEG, PNG, or WebP)",
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Image size must be less than 5MB",
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setIsLoading(true);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setIsLoading(false);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setIsLoading(false);
      if (onPhotoChange) {
        onPhotoChange(file);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`relative ${
          sizeClasses[size]
        } rounded-full overflow-hidden cursor-pointer group ${
          isDragging ? "ring-4 ring-[#00A8FF]" : ""
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 text-[#00A8FF] animate-spin" />
          </div>
        )}

        {/* Preview or placeholder */}
        {!isLoading && (
          <>
            {preview && !imageError ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Profile photo"
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  style={{ display: "block" }}
                  onError={() => {
                    setImageError(true);
                    setPreview(null);
                  }}
                  onLoad={() => {
                    setImageError(false);
                  }}
                />
                {/* Overlay on hover */}
                {!disabled && (
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center rounded-full z-10">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white border-2 border-gray-200 group-hover:border-[#00A8FF] transition-colors rounded-full">
                <User size={iconSizes[size]} className="text-gray-400" />
                {!disabled && (
                  <div className="absolute inset-0 bg-transparent group-hover:bg-gray-100 transition-all flex items-center justify-center rounded-full">
                    <Camera className="w-6 h-6 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
};

export default ProfilePhotoUpload;
