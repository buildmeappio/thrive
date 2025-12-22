"use client";
import { useState } from "react";
import { UseFormReturn, FieldValues } from "@/lib/form";
import { toast } from "sonner";

interface UseFormSubmissionOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  examinerProfileId: string | null;
  updateAction: (data: { examinerProfileId: string } & Partial<T>) => Promise<{
    success: boolean;
    message?: string;
    data?: any;
  }>;
  onComplete: () => void;
  onMarkComplete?: () => void;
  successMessage?: string;
  errorMessage?: string;
  validateBeforeSubmit?: (values: T) => string | null;
  transformValues?: (values: T) => Partial<T>;
  onDataUpdate?: (data: Partial<T>) => void;
  isSettingsPage?: boolean;
}

/**
 * Generic hook for handling form submission and mark as complete
 * Eliminates duplicate logic across onboarding forms
 */
export function useFormSubmission<T extends FieldValues>({
  form,
  examinerProfileId,
  updateAction,
  onComplete,
  onMarkComplete,
  successMessage = "Form saved successfully",
  errorMessage = "Failed to save form",
  validateBeforeSubmit,
  transformValues,
  onDataUpdate,
  isSettingsPage = false,
}: UseFormSubmissionOptions<T>) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: T) => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Custom validation if provided
    if (validateBeforeSubmit) {
      const validationError = validateBeforeSubmit(values);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    setLoading(true);
    try {
      const transformedValues = transformValues
        ? transformValues(values)
        : values;
      const result = await updateAction({
        examinerProfileId,
        ...transformedValues,
      });

      if (result.success) {
        // Update parent component's data state if callback is provided (for settings page)
        if (onDataUpdate && isSettingsPage) {
          onDataUpdate(transformedValues);
        }
        toast.success(successMessage);
        onComplete();
      } else {
        toast.error(result.message || errorMessage);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
      toast.error("Examiner profile ID not found");
      return false;
    }

    // Validate form before proceeding
    const isValid = await form.trigger();
    if (!isValid) {
      // Custom validation if provided
      if (validateBeforeSubmit) {
        const values = form.getValues();
        const validationError = validateBeforeSubmit(values);
        if (validationError) {
          toast.error(validationError);
          return false;
        }
      } else {
        toast.error("Please fix validation errors before marking as complete");
      }
      return false;
    }

    const values = form.getValues();

    // Custom validation if provided
    if (validateBeforeSubmit) {
      const validationError = validateBeforeSubmit(values);
      if (validationError) {
        toast.error(validationError);
        return false;
      }
    }

    setLoading(true);
    try {
      const transformedValues = transformValues
        ? transformValues(values)
        : values;
      const result = await updateAction({
        examinerProfileId,
        ...transformedValues,
      });

      if (result.success) {
        toast.success(`${successMessage} and marked as complete`);
        if (onMarkComplete) {
          onMarkComplete();
        }
        onComplete();
        return true;
      } else {
        toast.error(result.message || errorMessage);
        return false;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    handleMarkComplete,
    loading,
  };
}
