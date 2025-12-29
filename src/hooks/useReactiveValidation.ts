import { useState, useCallback } from 'react';
import { FormikHelpers, FormikErrors, FormikProps } from 'formik';

/**
 * Custom hook for reactive form validation
 * Shows/hides errors in real-time after the first submit attempt
 *
 * @template T - The form values type
 * @returns Object containing validation state and handlers
 */
export function useReactiveValidation<T extends Record<string, any>>() {
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  /**
   * Marks that the form has been submitted/attempted
   * This enables real-time validation for all fields
   */
  const markAsAttempted = useCallback(() => {
    setAttemptedSubmit(true);
  }, []);

  /**
   * Handles form submission with validation
   * Sets errors and enables reactive validation if validation fails
   * @param priorityFields - Optional array of field names to prioritize (errors shown first)
   */
  const handleSubmitWithValidation = useCallback(
    async (
      values: T,
      formikHelpers: FormikHelpers<T>,
      onSubmit: (values: T, helpers: FormikHelpers<T>) => Promise<void> | void,
      priorityFields?: (keyof T)[]
    ) => {
      markAsAttempted();

      // Validate form
      const errors = await formikHelpers.validateForm();

      // If there are any errors, set errors and touched fields, then return
      if (Object.keys(errors).length > 0) {
        // Set errors in Formik state so they can be displayed
        formikHelpers.setErrors(errors);

        // Set priority fields as touched first (if specified)
        if (priorityFields && priorityFields.length > 0) {
          priorityFields.forEach(field => {
            if (errors[field as string]) {
              formikHelpers.setFieldTouched(field as string, true);
            }
          });
        }

        // Set all error fields as touched
        Object.keys(errors).forEach(field => {
          if (!priorityFields || !priorityFields.includes(field as keyof T)) {
            formikHelpers.setFieldTouched(field, true);
          }
        });
        formikHelpers.setSubmitting(false);
        return;
      }

      // If validation passes, proceed with submission
      await onSubmit(values, formikHelpers);
    },
    [markAsAttempted]
  );

  /**
   * Creates a change handler that validates the field in real-time after attempted submit
   */
  const createReactiveChangeHandler = useCallback(
    (
      fieldName: keyof T,
      originalHandler: (e: React.ChangeEvent<any>) => void,
      formikBag: FormikProps<T>
    ) => {
      return async (e: React.ChangeEvent<any>) => {
        // Call original handler first to update the value in Formik
        originalHandler(e);

        // If form has been attempted, validate this field in real-time
        if (attemptedSubmit) {
          // Set field as touched
          formikBag.setFieldTouched(fieldName as string, true);

          // Use requestAnimationFrame to ensure DOM is updated, then setTimeout for Formik state
          requestAnimationFrame(() => {
            setTimeout(async () => {
              try {
                // Validate the field - Formik should have the updated value by now
                const error = await formikBag.validateField(fieldName as string);

                const fieldKey = fieldName as string;

                // Get current errors - read fresh from Formik state
                // We need to read this AFTER validateField to get the latest state
                const currentErrors: FormikErrors<T> = { ...formikBag.errors };

                // Check if error state actually changed
                const hadError = !!currentErrors[fieldKey as keyof T];
                const hasError = error !== undefined;

                // Only update if error state changed to avoid unnecessary re-renders
                if (
                  hadError !== hasError ||
                  (hasError && currentErrors[fieldKey as keyof T] !== error)
                ) {
                  if (error === undefined) {
                    // Clear error if field is now valid
                    const updatedErrors = { ...currentErrors };
                    delete updatedErrors[fieldKey as keyof T];
                    formikBag.setErrors(updatedErrors);
                  } else {
                    // Set error if field is invalid
                    const updatedErrors: FormikErrors<T> = { ...currentErrors };
                    (updatedErrors as any)[fieldKey] = error;
                    formikBag.setErrors(updatedErrors);
                  }
                }
              } catch {
                // Validation errors are handled by Formik
              }
            }, 50);
          });
        }
      };
    },
    [attemptedSubmit]
  );

  /**
   * Creates a blur handler that validates the field when it loses focus (after attempted submit)
   */
  const createReactiveBlurHandler = useCallback(
    (
      fieldName: keyof T,
      originalHandler: (e: React.FocusEvent<any>) => void,
      formikBag: FormikProps<T>
    ) => {
      return async (e: React.FocusEvent<any>) => {
        // Call original handler first
        originalHandler(e);

        // If form has been attempted, validate this field on blur
        if (attemptedSubmit) {
          formikBag.setFieldTouched(fieldName as string, true);
          try {
            // Validate only this field - returns error string or undefined
            const error = await formikBag.validateField(fieldName as string);

            const fieldKey = fieldName as string;

            // Get current errors - we need to read this AFTER validateField to get latest state
            const currentErrors: FormikErrors<T> = { ...formikBag.errors };

            // Always update the error state to ensure Formik re-renders
            if (error === undefined) {
              // Clear error if field is now valid - must manually delete from errors object
              if (currentErrors[fieldKey as keyof T]) {
                const updatedErrors = { ...currentErrors };
                delete updatedErrors[fieldKey as keyof T];
                formikBag.setErrors(updatedErrors);
              }
            } else {
              // Set error if field is invalid
              const updatedErrors: FormikErrors<T> = { ...currentErrors };
              (updatedErrors as any)[fieldKey] = error;
              formikBag.setErrors(updatedErrors);
            }
          } catch {
            // Validation errors are handled by Formik
          }
        }
      };
    },
    [attemptedSubmit]
  );

  /**
   * Determines if errors should be shown for a field
   * Errors are shown if:
   * 1. Form has been attempted to submit, OR
   * 2. Field has been touched
   */
  const shouldShowError = useCallback(
    (fieldName: keyof T, touched: Record<string, boolean>, _errors: FormikErrors<T>) => {
      return attemptedSubmit || !!touched[fieldName as string];
    },
    [attemptedSubmit]
  );

  return {
    attemptedSubmit,
    markAsAttempted,
    handleSubmitWithValidation,
    createReactiveChangeHandler,
    createReactiveBlurHandler,
    shouldShowError,
  };
}
