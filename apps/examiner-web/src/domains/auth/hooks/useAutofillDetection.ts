'use client';
import { useEffect, useState } from 'react';
import { UseFormReturn, FieldValues, Path } from '@/lib/form';

interface UseAutofillDetectionOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  watchedFields: (keyof T)[];
}

/**
 * Hook for detecting browser autofill and triggering validation
 * Handles autofill detection for form fields that may be filled by browser
 */
export function useAutofillDetection<T extends FieldValues>({
  form,
  watchedFields,
}: UseAutofillDetectionOptions<T>) {
  const [, setAutofillCheck] = useState(0);

  useEffect(() => {
    // Periodic check for autofill values
    const checkAutofill = setInterval(() => {
      const formValues = form.getValues();
      const watchedValues = watchedFields.reduce(
        (acc, field) => {
          acc[field] = form.watch(field as Path<T>);
          return acc;
        },
        {} as Record<keyof T, any>
      );

      // Check if any form value differs from watched value (indicating autofill)
      const hasAutofill = watchedFields.some(field => {
        const formValue = formValues[field];
        const watchedValue = watchedValues[field];
        return formValue && formValue !== watchedValue;
      });

      if (hasAutofill) {
        form.trigger(); // Trigger validation to update form state
        setAutofillCheck(prev => prev + 1); // Force re-render
      }
    }, 300); // Check every 300ms

    // Listen for input events on all input fields (autofill triggers these)
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && watchedFields.some(field => target.id === String(field))) {
        setTimeout(() => {
          form.trigger(target.id as Path<T>);
          setAutofillCheck(prev => prev + 1);
        }, 50);
      }
    };

    // Listen for animationstart event (browsers use this for autofill)
    const handleAutofill = (e: AnimationEvent) => {
      if (e.animationName === 'onAutoFillStart' || e.animationName === 'onAutoFillCancel') {
        setTimeout(() => {
          form.trigger();
          setAutofillCheck(prev => prev + 1);
        }, 100);
      }
    };

    // Add event listeners
    document.addEventListener('input', handleInput, true);
    document.addEventListener('animationstart', handleAutofill as EventListener, true);

    return () => {
      clearInterval(checkAutofill);
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('animationstart', handleAutofill as EventListener, true);
    };
  }, [form, watchedFields]);
}
