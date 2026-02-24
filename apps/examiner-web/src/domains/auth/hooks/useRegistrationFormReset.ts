'use client';
import { useEffect, useRef, useMemo } from 'react';
import { UseFormReturn, FieldValues } from '@/lib/form';

interface UseRegistrationFormResetOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  defaultValues: T;
  watchFields?: (keyof T)[];
  keepErrors?: boolean;
}

/**
 * Hook for handling form reset logic in registration steps
 * Syncs form with store data while preserving errors if form has been submitted
 */
export function useRegistrationFormReset<T extends FieldValues>({
  form,
  defaultValues,
  watchFields,
  keepErrors = false,
}: UseRegistrationFormResetOptions<T>) {
  const hasBeenSubmittedRef = useRef(false);

  // Track if form has been submitted
  useEffect(() => {
    if (form.formState.isSubmitted) {
      hasBeenSubmittedRef.current = true;
    }
  }, [form.formState.isSubmitted]);

  // Create a dependency array based on watchFields if provided
  const dependencies = useMemo(() => {
    if (watchFields && watchFields.length > 0) {
      return watchFields.map(field => {
        const value = defaultValues[field];
        // For objects/arrays, use JSON.stringify for comparison
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      });
    }
    return [JSON.stringify(defaultValues)];
  }, [defaultValues, watchFields]);

  // Reset form when defaultValues change
  useEffect(() => {
    const hasBeenSubmitted = hasBeenSubmittedRef.current;
    form.reset(defaultValues, {
      keepErrors: keepErrors || hasBeenSubmitted, // Keep errors if form has been submitted
      keepDirty: false,
      keepIsSubmitted: hasBeenSubmitted,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: hasBeenSubmitted,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
