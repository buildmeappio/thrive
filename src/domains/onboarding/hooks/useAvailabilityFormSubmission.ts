"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { UseFormReturn } from "@/lib/form";
import { toast } from "sonner";
import { AvailabilityPreferencesInput } from "../schemas/onboardingSteps.schema";

interface UseAvailabilityFormSubmissionOptions {
  form: UseFormReturn<AvailabilityPreferencesInput>;
  examinerProfileId: string | null;
  convertToUTC: (values: AvailabilityPreferencesInput) => any;
  isCompleted?: boolean;
  onStepEdited?: () => void;
  onComplete: () => void;
  onMarkComplete?: () => void;
  onDataUpdate?: (data: any) => void;
  isSettingsPage?: boolean;
}

/**
 * Hook for handling availability form submission and change detection
 */
export function useAvailabilityFormSubmission({
  form,
  examinerProfileId,
  convertToUTC,
  isCompleted = false,
  onStepEdited,
  onComplete,
  onMarkComplete,
  onDataUpdate,
  isSettingsPage = false,
}: UseAvailabilityFormSubmissionOptions) {
  const [loading, setLoading] = useState(false);
  const previousFormDataRef = useRef<string | null>(null);
  const initialFormDataRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);

  // Watch form changes
  const formValues = form.watch();
  const isDirty = form.formState.isDirty;
  const formErrors = form.formState.errors;

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

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    const weeklyHours = formValues.weeklyHours;
    if (!weeklyHours || typeof weeklyHours !== "object") {
      return false;
    }

    // Check if at least one day has time slots enabled
    const hasTimeSlots = Object.values(weeklyHours).some(
      (day: unknown) =>
        day &&
        typeof day === "object" &&
        "enabled" in day &&
        day.enabled === true &&
        "timeSlots" in day &&
        Array.isArray(day.timeSlots) &&
        day.timeSlots.length > 0,
    );

    // Check bookingOptions
    const bookingOptions = formValues.bookingOptions;
    const hasBookingOptions = Boolean(
      bookingOptions &&
      typeof bookingOptions === "object" &&
      "maxIMEsPerWeek" in bookingOptions &&
      "minimumNotice" in bookingOptions &&
      bookingOptions.maxIMEsPerWeek &&
      bookingOptions.maxIMEsPerWeek.trim().length > 0 &&
      bookingOptions.minimumNotice &&
      bookingOptions.minimumNotice.trim().length > 0,
    );

    return (
      hasTimeSlots &&
      hasBookingOptions &&
      !formErrors.weeklyHours &&
      !formErrors.bookingOptions
    );
  }, [formValues, formErrors]);

  const handleSubmit = async (values: AvailabilityPreferencesInput) => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      // Convert local times to UTC before saving to database
      const utcValues = convertToUTC(values);

      // Ensure weeklyHours is provided (required by the action)
      if (!utcValues.weeklyHours) {
        throw new Error("Weekly hours are required");
      }

      const { saveAvailabilityAction } = await import("../server/actions");
      const result = await saveAvailabilityAction({
        examinerProfileId,
        weeklyHours: utcValues.weeklyHours,
        overrideHours: utcValues.overrideHours,
        bookingOptions: utcValues.bookingOptions as
          | {
              maxIMEsPerWeek: string;
              minimumNotice: string;
            }
          | undefined,
      });

      if (result.success) {
        // Update parent component's data state if callback is provided (for settings page)
        if (onDataUpdate && isSettingsPage) {
          onDataUpdate(values);
        }
        toast.success("Availability preferences saved successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to save availability");
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

    const isValid = await form.trigger();
    if (!isValid) {
      // Check for specific validation errors and show helpful messages
      const errors = form.formState.errors;
      if (errors.bookingOptions?.maxIMEsPerWeek) {
        toast.error(
          "Please select maximum IMEs per week in Additional Preferences",
        );
        return false;
      }
      if (errors.bookingOptions?.minimumNotice) {
        toast.error(
          "Please select minimum notice required in Additional Preferences",
        );
        return false;
      }
      if (errors.weeklyHours) {
        toast.error(
          "Please set at least one day with time slots in Weekly Hours",
        );
        return false;
      }
      toast.error("Please fix validation errors before marking as complete");
      return false;
    }

    const values = form.getValues();
    setLoading(true);
    try {
      // Convert local times to UTC before saving to database
      const utcValues = convertToUTC(values);

      // Ensure weeklyHours is provided (required by the action)
      if (!utcValues.weeklyHours) {
        throw new Error("Weekly hours are required");
      }

      const { saveAvailabilityAction } = await import("../server/actions");
      const result = await saveAvailabilityAction({
        examinerProfileId,
        weeklyHours: utcValues.weeklyHours,
        overrideHours: utcValues.overrideHours,
        bookingOptions: utcValues.bookingOptions as
          | {
              maxIMEsPerWeek: string;
              minimumNotice: string;
            }
          | undefined,
      });

      if (result.success) {
        // Update initial form data reference to current values so future changes are detected
        const currentHash = JSON.stringify(values);
        initialFormDataRef.current = currentHash;
        previousFormDataRef.current = currentHash;

        toast.success("Availability preferences saved and marked as complete");
        if (onMarkComplete) {
          onMarkComplete();
        }
        onComplete();
      } else {
        toast.error(result.message || "Failed to save availability");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    handleMarkComplete,
    loading,
    isFormValid,
    initialFormDataRef,
    previousFormDataRef,
    isInitialMountRef,
  };
}
