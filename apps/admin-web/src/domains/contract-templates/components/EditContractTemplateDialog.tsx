'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateContractTemplateAction } from '../actions';

type Props = {
  open: boolean;
  onClose: () => void;
  template: {
    id: string;
    displayName: string;
    slug: string;
  };
  onSuccess?: () => void;
};

export default function EditContractTemplateDialog({ open, onClose, template, onSuccess }: Props) {
  const [displayName, setDisplayName] = useState(template.displayName);
  const [slug, setSlug] = useState(template.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Helper function to check if display name contains at least one letter
  const hasAtLeastOneLetter = (value: string): boolean => {
    return /[a-zA-Z]/.test(value.trim());
  };

  // Validate display name
  const validateDisplayName = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return 'Display name is required';
    }
    if (trimmed.length < 2) {
      return 'Display name must be at least 2 characters';
    }
    if (trimmed.length > 100) {
      return 'Display name must not exceed 100 characters';
    }
    if (!/^[a-zA-Z0-9\s\-'.,()&]+$/.test(trimmed)) {
      return 'Display name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands';
    }
    if (!hasAtLeastOneLetter(trimmed)) {
      return 'Display name must contain at least one letter';
    }
    return null;
  };

  // Auto-generate slug from display name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDisplayName(template.displayName);
      setSlug(template.slug);
      setSlugManuallyEdited(false);
      setFieldErrors({});
    }
  }, [open, template]);

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    // Clear display name error when user starts typing
    if (fieldErrors.displayName) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.displayName;
        return newErrors;
      });
    }
    // Only auto-update slug if it hasn't been manually edited
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    // Sanitize slug input
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(sanitized);
    setSlugManuallyEdited(true);
  };

  const canSubmit = slug.trim().length > 0 && displayName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    // Validate display name before submission
    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) {
      setFieldErrors({ displayName: displayNameError });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await updateContractTemplateAction({
        id: template.id,
        displayName: displayName.trim(),
        slug: slug.trim(),
      });

      if (result.success) {
        toast.success('Contract template updated successfully');
        onSuccess?.();
        onClose();
      } else {
        const errorResult = result as {
          success: false;
          error: string;
          fieldErrors?: Record<string, string>;
        };
        toast.error(errorResult.error || 'Failed to update contract template');
        if (errorResult.fieldErrors) {
          setFieldErrors(errorResult.fieldErrors);
        }
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-degular text-xl font-semibold">
            Edit Contract Template
          </DialogTitle>
          <DialogDescription className="font-poppins text-[#7B8B91]">
            Update the name and slug for this contract template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Display Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="displayName" className="font-poppins">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="displayName"
              className="font-poppins rounded-[14px] border-gray-200"
              value={displayName}
              onChange={e => handleDisplayNameChange(e.target.value)}
              placeholder="e.g., IME Examiner Agreement"
              maxLength={100}
              autoFocus
              disabled={isSubmitting}
            />
            {fieldErrors.displayName && (
              <p className="font-poppins text-sm text-red-500">{fieldErrors.displayName}</p>
            )}
          </div>

          {/* Slug Field */}
          <div className="grid gap-2">
            <Label htmlFor="slug" className="font-poppins">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              className="font-poppins rounded-[14px] border-gray-200"
              value={slug}
              onChange={e => handleSlugChange(e.target.value)}
              placeholder="e.g., ime-examiner-agreement"
              maxLength={255}
              disabled={isSubmitting}
            />
            <p className="font-poppins text-xs text-gray-500">
              Lowercase letters, numbers, and hyphens only. Auto-generated from display name.
            </p>
            {fieldErrors.slug && (
              <p className="font-poppins text-sm text-red-500">{fieldErrors.slug}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isSubmitting ? 'Updating...' : 'Update Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
