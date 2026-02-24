'use client';
import { useState } from 'react';
import { UseFormReturn, FieldValues } from '@/lib/form';
import { toast } from 'sonner';

interface UseMarkAsCompleteOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  examinerProfileId: string | null | undefined;
  onMarkComplete?: () => void;
  onComplete: () => void;
  updateAction: (data: { examinerProfileId: string } & Partial<T>) => Promise<{
    success: boolean;
    message?: string;
  }>;
  getValidationErrors?: (values: T) => string | null;
}

/**
 * Hook for handling "Mark as Complete" functionality in onboarding forms
 * Handles validation, saving, and completion callbacks
 */
export function useMarkAsComplete<T extends FieldValues>({
  form,
  examinerProfileId,
  onMarkComplete,
  onComplete,
  updateAction,
  getValidationErrors,
}: UseMarkAsCompleteOptions<T>) {
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    if (!examinerProfileId) {
      toast.error('Examiner profile ID not found');
      return;
    }

    // Validate form before proceeding
    const isValid = await form.trigger();
    if (!isValid) {
      const values = form.getValues();

      // Use custom validation error handler if provided
      if (getValidationErrors) {
        const customError = getValidationErrors(values);
        if (customError) {
          toast.error(customError);
          return;
        }
      }

      // Generic error if validation fails
      const errors = form.formState.errors;
      toast.error(
        errors.root?.message || 'Please fix validation errors before marking as complete'
      );
      return;
    }

    const values = form.getValues();
    setLoading(true);
    try {
      const result = await updateAction({
        examinerProfileId,
        ...values,
      });

      if (result.success) {
        toast.success('Step saved and marked as complete');
        // Mark step as complete
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
        onComplete();
      } else {
        toast.error(result.message || 'Failed to update step');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleMarkComplete,
    loading,
  };
}
