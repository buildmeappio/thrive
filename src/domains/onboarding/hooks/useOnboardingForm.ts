"use client";
import { useEffect, useMemo, useRef } from "react";
import { UseFormReturn, FieldValues } from "@/lib/form";

interface UseOnboardingFormOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  defaultValues: T;
  isCompleted?: boolean;
  onStepEdited?: () => void;
}

/**
 * Hook for managing onboarding form state and lifecycle
 * Handles form initialization, reset, and change tracking
 */
export function useOnboardingForm<T extends FieldValues>({
  form,
  defaultValues,
  isCompleted = false,
  onStepEdited,
}: UseOnboardingFormOptions<T>) {
  const isInitializedRef = useRef(false);
  const initialFormDataRef = useRef<string | null>(null);

  // Reset form when defaultValues change (e.g., when data is refetched)
  useEffect(() => {
    // Always reset form when defaultValues change to ensure form is in sync
    form.reset(defaultValues);

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }

    // Store initial data hash to detect changes
    const initialHash = JSON.stringify(defaultValues);
    initialFormDataRef.current = initialHash;
  }, [defaultValues, form]);

  // Watch form values for change detection
  const formValues = form.watch();
  const isDirty = form.formState.isDirty;

  // Check if form values have changed from initial saved values
  const hasFormChanged = useMemo(() => {
    if (!initialFormDataRef.current) return false;
    const currentHash = JSON.stringify(formValues);
    return currentHash !== initialFormDataRef.current;
  }, [formValues]);

  // If form is dirty or has changed from initial values, and step is completed, mark as incomplete
  useEffect(() => {
    if ((isDirty || hasFormChanged) && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [isDirty, hasFormChanged, isCompleted, onStepEdited]);

  return {
    isInitialized: isInitializedRef.current,
    hasFormChanged,
    isDirty,
    formValues,
    initialFormDataRef,
  };
}
