'use client';
import React, { useState, useRef } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import logger from '@/utils/logger';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoChange?: (file: File | null) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
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
  size = 'md',
}) => {
  // Only set preview if currentPhotoUrl is a valid string
  const [preview, setPreview] = useState<string | null>(
    currentPhotoUrl && currentPhotoUrl.trim() !== '' ? currentPhotoUrl : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add image load error handler
  const [imageError, setImageError] = useState(false);

  // Track if we have a local file preview (data URL from FileReader)
  const hasLocalPreviewRef = React.useRef(false);
  const previousPhotoUrlRef = React.useRef<string | null | undefined>(currentPhotoUrl);
  const previewRef = React.useRef<string | null>(preview);

  // Sync preview ref with preview state
  React.useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  // Update preview when currentPhotoUrl changes (e.g., when navigating back to the form)
  React.useEffect(() => {
    // Only update if currentPhotoUrl actually changed (not just on every render)
    if (previousPhotoUrlRef.current === currentPhotoUrl) {
      return;
    }
    previousPhotoUrlRef.current = currentPhotoUrl;

    // Don't update if we have a local preview (user just uploaded a file)
    if (hasLocalPreviewRef.current) {
      return;
    }

    if (currentPhotoUrl && currentPhotoUrl.trim() !== '') {
      // Only update if the URL is different from current preview
      if (previewRef.current !== currentPhotoUrl) {
        setPreview(currentPhotoUrl);
        setImageError(false);
        hasLocalPreviewRef.current = false; // Reset flag when using URL
      }
    } else if (currentPhotoUrl === null || currentPhotoUrl === undefined) {
      // Only clear preview if we don't have a local preview
      if (!previewRef.current || !previewRef.current.startsWith('data:')) {
        setPreview(null);
      }
    }
  }, [currentPhotoUrl]); // Removed preview from dependencies to prevent infinite loops

  // Size configurations
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image (JPEG, PNG, or WebP)',
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB',
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setIsLoading(true);
    setImageError(false);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setIsLoading(false);
      hasLocalPreviewRef.current = false;
      return;
    }

    // Create preview with timeout fallback
    const reader = new FileReader();
    let completed = false;

    const completeLoading = () => {
      if (!completed) {
        completed = true;
        setIsLoading(false);
      }
    };

    // Timeout fallback (5 seconds)
    const timeoutId = setTimeout(() => {
      if (!completed) {
        setError('File reading took too long. Please try again.');
        hasLocalPreviewRef.current = false;
        completeLoading();
      }
    }, 5000);

    reader.onloadend = () => {
      clearTimeout(timeoutId);
      if (!completed && reader.result) {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        hasLocalPreviewRef.current = true; // Mark that we have a local preview
        completeLoading();
        if (onPhotoChange) {
          onPhotoChange(file);
        }
      }
    };
    reader.onerror = () => {
      clearTimeout(timeoutId);
      setError('Failed to read file');
      hasLocalPreviewRef.current = false;
      completeLoading();
    };
    reader.onabort = () => {
      clearTimeout(timeoutId);
      setError('File reading was cancelled');
      hasLocalPreviewRef.current = false;
      completeLoading();
    };

    try {
      reader.readAsDataURL(file);
    } catch (err) {
      logger.error('Failed to read file', err);
      clearTimeout(timeoutId);
      setError('Failed to read file');
      hasLocalPreviewRef.current = false;
      completeLoading();
    }
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
        } group cursor-pointer overflow-hidden rounded-full ${
          isDragging ? 'ring-4 ring-[#00A8FF]' : ''
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
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
            <Loader2 className="h-8 w-8 animate-spin text-[#00A8FF]" />
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
                  className="absolute inset-0 h-full w-full rounded-full object-cover"
                  style={{ display: 'block' }}
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
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-opacity-0 transition-all group-hover:bg-opacity-40">
                    <Camera className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-colors group-hover:border-[#00A8FF]">
                <User size={iconSizes[size]} className="text-gray-400" />
                {!disabled && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-transparent transition-all group-hover:bg-gray-100">
                    <Camera className="h-6 w-6 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-center text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ProfilePhotoUpload;
