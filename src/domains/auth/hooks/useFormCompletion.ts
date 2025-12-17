"use client";
import { useMemo } from "react";
import { UseFormReturn } from "@/lib/form";

interface UseFormCompletionOptions<T> {
  form: UseFormReturn<T>;
  requiredFields: (keyof T)[];
}

/**
 * Hook for checking if form is complete based on required fields
 * Uses both watched values and getValues() as fallback to handle autofill cases
 */
export function useFormCompletion<T>({
  form,
  requiredFields,
}: UseFormCompletionOptions<T>) {
  const formValues = form.watch(requiredFields);
  const formErrors = form.formState.errors;

  const isFormComplete = useMemo(() => {
    // Get all form values as fallback (handles autofill cases)
    const allFormValues = form.getValues();

    // Check if all required fields have values
    const allFieldsFilled = requiredFields.every((field) => {
      // Use watched value first, fallback to getValues() for autofill detection
      const watchedValue = formValues[field];
      const formValue = allFormValues[field];
      const value = watchedValue ?? formValue;

      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      return Boolean(value);
    });

    // Check if there are no errors in required fields
    const noErrors = requiredFields.every((field) => !formErrors[field]);

    return allFieldsFilled && noErrors;
  }, [formValues, formErrors, requiredFields, form]);

  return { isFormComplete };
}
