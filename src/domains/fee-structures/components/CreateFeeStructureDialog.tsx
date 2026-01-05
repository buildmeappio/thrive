"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFeeStructureAction } from "../actions";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateFeeStructureDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Helper function to check if name contains at least one letter
  const hasAtLeastOneLetter = (value: string): boolean => {
    return /[a-zA-Z]/.test(value.trim());
  };

  // Validate name
  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "Name is required";
    }
    if (trimmed.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (trimmed.length > 255) {
      return "Name must be less than 255 characters";
    }
    if (!/^[a-zA-Z0-9\s\-'.,()&]+$/.test(trimmed)) {
      return "Name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands";
    }
    if (!hasAtLeastOneLetter(trimmed)) {
      return "Name must contain at least one letter";
    }
    return null;
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setFieldErrors({});
    }
  }, [open]);

  const canSubmit = name.trim().length > 0 && validateName(name) === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    // Validate name before submission
    const nameError = validateName(name);
    if (nameError) {
      setFieldErrors({ name: nameError });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createFeeStructureAction({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success("Fee structure created successfully");
        onClose();
        router.push(`/dashboard/fee-structures/${result.data.id}`);
      } else {
        const errorResult = result as {
          success: false;
          error: string;
          fieldErrors?: Record<string, string>;
        };
        toast.error(errorResult.error || "Failed to create fee structure");
        if (errorResult.fieldErrors) {
          setFieldErrors(errorResult.fieldErrors);
        }
      }
    } catch {
      toast.error("An error occurred");
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
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-degular font-semibold">
            New Fee Structure
          </DialogTitle>
          <DialogDescription className="text-[#7B8B91] font-poppins">
            Create a new rate card to manage your fee variables.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-poppins">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              className="rounded-[14px] border-gray-200 font-poppins"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Clear name error when user starts typing
                if (fieldErrors.name) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.name;
                    return newErrors;
                  });
                }
              }}
              placeholder="e.g., Standard Examiner Rates 2025"
              maxLength={255}
              autoFocus
              disabled={isSubmitting}
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="font-poppins">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short notes about when to use this fee structure..."
              rows={3}
              className="rounded-[14px] border-gray-200 font-poppins resize-none"
              disabled={isSubmitting}
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.description}
              </p>
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
            className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
