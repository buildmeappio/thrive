"use client";
import { useMemo } from "react";
import { UseFormReturn, FieldValues } from "@/lib/form";

interface UseFormCompletionOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  requiredFields: (keyof T)[];
}

/**
 * Hook for checking if form is complete based on required fields
 * Uses both watched values and getValues() as fallback to handle autofill cases
 */
export function useFormCompletion<T extends FieldValues>({
  form,
  requiredFields,
}: UseFormCompletionOptions<T>) {
  // Watch all form values to detect autofill
  const formValues = form.watch();

  const isFormComplete = useMemo(() => {
    // Get all form values as fallback (handles autofill cases)
    const allFormValues = form.getValues();

    // Check if all required fields have values
    // Don't check for validation errors - allow user to submit and see validation messages
    const allFieldsFilled = requiredFields.every((field) => {
      // Use watched value first, fallback to getValues() for autofill detection
      const watchedValue = formValues[field as keyof typeof formValues];
      const formValue = allFormValues[field as keyof typeof allFormValues];
      const value = watchedValue ?? formValue;

      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      return Boolean(value);
    });

    // Only check if fields are filled, not validation errors
    // Validation errors will be shown on submit, but won't disable the continue button
    return allFieldsFilled;
  }, [formValues, requiredFields, form]);

  return { isFormComplete };
}
