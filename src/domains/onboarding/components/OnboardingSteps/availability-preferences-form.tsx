"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/use-form-hook";
import { FormProvider } from "@/components/form";
import { CircleCheck } from "lucide-react";
import {
  availabilityPreferencesSchema,
  AvailabilityPreferencesInput,
} from "../../schemas/onboardingSteps.schema";
import { availabilityInitialValues } from "../../constants";
import { WeeklyHours, BookingOptions } from "./AvailabilityTabs";
import { toast } from "sonner";
import {
  convertAvailabilityToUTC,
  convertAvailabilityToLocal,
  convertUTCToLocal,
} from "@/utils/timeConversion";
import { timeOptions } from "@/constants/options";
import { useOnboardingStore } from "../../state/useOnboardingStore";

import type { AvailabilityPreferencesFormProps } from "../../types";

const AvailabilityPreferencesForm: React.FC<
  AvailabilityPreferencesFormProps
> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "weeklyHours" | "overrideHours" | "bookingOptions"
  >("weeklyHours");

  // Get store data and actions
  const { availabilityData, mergeAvailabilityData } = useOnboardingStore();

  // Determine initial data: Merge store data with DB data (store takes precedence for user changes)
  const formInitialData = useMemo(() => {
    // Check if we have valid data from DB
    const hasDbData =
      initialData &&
      initialData.weeklyHours &&
      typeof initialData.weeklyHours === "object" &&
      Object.keys(initialData.weeklyHours).length > 0;

    let dbData: Partial<AvailabilityPreferencesInput>;
    if (hasDbData) {
      // Convert UTC to local time for display (using browser's timezone)
      // The data from database is in UTC format (HH:mm), we need to convert to local 12-hour format
      // This conversion happens on the frontend, so it uses the browser's local timezone
      const converted = convertAvailabilityToLocal(initialData);

      // Double-check conversion: if times are still in UTC format (HH:mm), convert them manually
      // This ensures conversion happens on the frontend using browser's timezone
      let processedWeeklyHours = converted.weeklyHours;
      if (processedWeeklyHours) {
        const days = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ] as const;
        const newWeeklyHours: any = {};

        days.forEach((day) => {
          const dayData = processedWeeklyHours?.[day];
          if (dayData) {
            newWeeklyHours[day] = {
              enabled: dayData.enabled,
              timeSlots: dayData.timeSlots.map(
                (slot: { startTime: string; endTime: string }) => {
                  // Check if times are in UTC format (HH:mm) - if so, convert to local
                  let startTime = slot.startTime;
                  let endTime = slot.endTime;

                  // If time is in UTC format (HH:mm like "13:00"), convert it using browser's timezone
                  if (
                    /^\d{1,2}:\d{2}$/.test(startTime) &&
                    !timeOptions.includes(startTime)
                  ) {
                    startTime = convertUTCToLocal(startTime);
                  }
                  if (
                    /^\d{1,2}:\d{2}$/.test(endTime) &&
                    !timeOptions.includes(endTime)
                  ) {
                    endTime = convertUTCToLocal(endTime);
                  }

                  return { startTime, endTime };
                }
              ),
            };
          }
        });
        processedWeeklyHours = newWeeklyHours;
      }

      dbData = {
        weeklyHours: processedWeeklyHours,
        overrideHours: converted.overrideHours,
        bookingOptions: converted.bookingOptions
          ? {
              maxIMEsPerWeek:
                (converted.bookingOptions as any).maxIMEsPerWeek || "",
              minimumNotice:
                (converted.bookingOptions as any).minimumNotice || "",
            }
          : undefined,
      };
    } else {
      // No DB data, use initial values
      dbData = availabilityInitialValues;
    }

    // Merge store data with DB data (store data takes precedence)
    const storeData = availabilityData || {};

    // Ensure bookingOptions has the correct type from store
    const storeBookingOptions = storeData.bookingOptions
      ? {
          maxIMEsPerWeek:
            (storeData.bookingOptions as any).maxIMEsPerWeek || "",
          minimumNotice: (storeData.bookingOptions as any).minimumNotice || "",
        }
      : undefined;

    // Ensure bookingOptions has the correct type from DB
    const dbBookingOptions = dbData.bookingOptions
      ? {
          maxIMEsPerWeek: (dbData.bookingOptions as any).maxIMEsPerWeek || "",
          minimumNotice: (dbData.bookingOptions as any).minimumNotice || "",
        }
      : undefined;

    return {
      weeklyHours:
        storeData.weeklyHours ||
        dbData.weeklyHours ||
        availabilityInitialValues.weeklyHours,
      overrideHours: storeData.overrideHours || dbData.overrideHours || [],
      // Store bookingOptions takes precedence, then DB, then initial values
      bookingOptions: (storeBookingOptions ||
        dbBookingOptions || {
          maxIMEsPerWeek: "",
          minimumNotice: "",
        }) as { maxIMEsPerWeek: string; minimumNotice: string },
    };
  }, [initialData, availabilityData]);

  // Ensure all days have proper structure with valid time slots
  const ensuredFormData = useMemo(() => {
    const weeklyHours = {
      sunday: formInitialData.weeklyHours?.sunday || {
        enabled: false,
        timeSlots: [],
      },
      monday: formInitialData.weeklyHours?.monday || {
        enabled: true,
        timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
      },
      tuesday: formInitialData.weeklyHours?.tuesday || {
        enabled: true,
        timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
      },
      wednesday: formInitialData.weeklyHours?.wednesday || {
        enabled: true,
        timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
      },
      thursday: formInitialData.weeklyHours?.thursday || {
        enabled: true,
        timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
      },
      friday: formInitialData.weeklyHours?.friday || {
        enabled: true,
        timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
      },
      saturday: formInitialData.weeklyHours?.saturday || {
        enabled: false,
        timeSlots: [],
      },
    };

    // Clean up time slots - ensure they have valid non-empty values and are in the correct format
    Object.keys(weeklyHours).forEach((day) => {
      const dayKey = day as keyof typeof weeklyHours;
      const dayData = weeklyHours[dayKey];

      if (dayData.timeSlots && dayData.timeSlots.length > 0) {
        // Filter out invalid slots and ensure valid values that match timeOptions
        dayData.timeSlots = dayData.timeSlots
          .map((slot) => {
            // Check if times are in the timeOptions array (12-hour format)
            // If not, they might be in UTC format (HH:mm) and need conversion
            let startTime =
              slot.startTime && slot.startTime.trim()
                ? slot.startTime
                : "8:00 AM";
            let endTime =
              slot.endTime && slot.endTime.trim() ? slot.endTime : "11:00 AM";

            // If startTime is not in timeOptions, it might be in UTC format - try to convert
            if (
              !timeOptions.includes(startTime) &&
              /^\d{1,2}:\d{2}$/.test(startTime)
            ) {
              // It's in UTC format (HH:mm), convert to local
              const converted = convertUTCToLocal(startTime);
              startTime = timeOptions.includes(converted)
                ? converted
                : "8:00 AM";
            } else if (!timeOptions.includes(startTime)) {
              // Not in timeOptions and not UTC format, use default
              startTime = "8:00 AM";
            }

            // Same for endTime
            if (
              !timeOptions.includes(endTime) &&
              /^\d{1,2}:\d{2}$/.test(endTime)
            ) {
              // It's in UTC format (HH:mm), convert to local
              const converted = convertUTCToLocal(endTime);
              endTime = timeOptions.includes(converted)
                ? converted
                : "11:00 AM";
            } else if (!timeOptions.includes(endTime)) {
              // Not in timeOptions and not UTC format, use default
              endTime = "11:00 AM";
            }

            return { startTime, endTime };
          })
          .filter(
            (slot) =>
              slot.startTime &&
              slot.endTime &&
              timeOptions.includes(slot.startTime) &&
              timeOptions.includes(slot.endTime)
          );

        // If enabled but no valid slots after filtering, add default
        if (dayData.enabled && dayData.timeSlots.length === 0) {
          dayData.timeSlots = [{ startTime: "8:00 AM", endTime: "11:00 AM" }];
        }
      } else if (dayData.enabled) {
        // Enabled but no slots, add default
        dayData.timeSlots = [{ startTime: "8:00 AM", endTime: "11:00 AM" }];
      }
    });

    return {
      weeklyHours,
      overrideHours: formInitialData.overrideHours || [],
      // Preserve bookingOptions from formInitialData (which includes store data)
      bookingOptions: formInitialData.bookingOptions || {
        maxIMEsPerWeek: "",
        minimumNotice: "",
      },
    };
  }, [formInitialData]);

  const form = useForm<AvailabilityPreferencesInput>({
    schema: availabilityPreferencesSchema,
    defaultValues: ensuredFormData,
    mode: "onSubmit",
  });

  // Track previous values to prevent infinite loops
  const previousStoreDataRef = React.useRef<string | null>(null);
  const previousFormDataRef = React.useRef<string | null>(null);
  const initialFormDataRef = React.useRef<string | null>(null);
  const isInitialMountRef = React.useRef(true);

  // Reset form when ensuredFormData changes (only on initial load or when DB data changes)
  useEffect(() => {
    const currentHash = JSON.stringify(ensuredFormData);

    // Skip if this is the same data we already have
    if (previousFormDataRef.current === currentHash) return;

    // Reset form with complete data
    form.reset(ensuredFormData, { keepDefaultValues: false });

    previousFormDataRef.current = currentHash;
    previousStoreDataRef.current = currentHash;

    // Store initial form data hash for comparison
    if (isInitialMountRef.current) {
      initialFormDataRef.current = currentHash;
      isInitialMountRef.current = false;
    }
  }, [ensuredFormData, form]);

  // Watch form changes and update store (only when user actually changes values)
  const formValues = form.watch();
  const isDirty = form.formState.isDirty;
  const formErrors = form.formState.errors;

  useEffect(() => {
    // Compare current values with previous form data to detect user changes
    const currentHash = JSON.stringify(formValues);

    // Skip if this matches the initial form data (no user changes yet)
    if (currentHash === previousFormDataRef.current) return;

    // Skip if this matches previous store data (already saved)
    if (currentHash === previousStoreDataRef.current) return;

    // User has made changes - update store
    const timeoutId = setTimeout(() => {
      mergeAvailabilityData(formValues);
      previousStoreDataRef.current = currentHash;
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [formValues, mergeAvailabilityData]);

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
        day.timeSlots.length > 0
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
      bookingOptions.minimumNotice.trim().length > 0
    );

    return (
      hasTimeSlots &&
      hasBookingOptions &&
      !formErrors.weeklyHours &&
      !formErrors.bookingOptions
    );
  }, [formValues, formErrors]);

  const onSubmit = async (values: AvailabilityPreferencesInput) => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      // Convert local times to UTC before saving to database
      const utcValues = convertAvailabilityToUTC(values);

      // Ensure weeklyHours is provided (required by the action)
      if (!utcValues.weeklyHours) {
        throw new Error("Weekly hours are required");
      }

      const { saveAvailabilityAction } = await import("../../server/actions");
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
        // Update store with saved values (convert to local for storage)
        const localValues = convertAvailabilityToLocal(utcValues);
        // Ensure bookingOptions has the correct type
        const storeData: Partial<AvailabilityPreferencesInput> = {
          ...localValues,
          bookingOptions: localValues.bookingOptions
            ? {
                maxIMEsPerWeek:
                  (localValues.bookingOptions as any).maxIMEsPerWeek || "",
                minimumNotice:
                  (localValues.bookingOptions as any).minimumNotice || "",
              }
            : undefined,
        };
        mergeAvailabilityData(storeData);
        toast.success("Availability preferences saved successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to save availability");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle "Mark as Complete" - saves and marks step as complete
  const handleMarkComplete = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix validation errors before marking as complete");
      return;
    }

    const values = form.getValues();
    setLoading(true);
    try {
      // Convert local times to UTC before saving to database
      const utcValues = convertAvailabilityToUTC(values);

      // Ensure weeklyHours is provided (required by the action)
      if (!utcValues.weeklyHours) {
        throw new Error("Weekly hours are required");
      }

      const { saveAvailabilityAction } = await import("../../server/actions");
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
        // Update store with saved values (convert to local for storage)
        const localValues = convertAvailabilityToLocal(utcValues);
        // Ensure bookingOptions has the correct type
        const storeData: Partial<AvailabilityPreferencesInput> = {
          ...localValues,
          bookingOptions: localValues.bookingOptions
            ? {
                maxIMEsPerWeek:
                  (localValues.bookingOptions as any).maxIMEsPerWeek || "",
                minimumNotice:
                  (localValues.bookingOptions as any).minimumNotice || "",
              }
            : undefined,
        };
        mergeAvailabilityData(storeData);

        // Update initial form data reference to current values so future changes are detected
        const currentHash = JSON.stringify(values);
        initialFormDataRef.current = currentHash;
        previousFormDataRef.current = currentHash;
        previousStoreDataRef.current = currentHash;

        toast.success("Availability preferences saved and marked as complete");
        // Mark step as complete
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
        onComplete();
      } else {
        toast.error(result.message || "Failed to save availability");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl px-8 py-4 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">Set Your Availability</h2>
        </div>
        {/* Mark as Complete Button - Top Right */}
        {!isCompleted && (
          <Button
            type="submit"
            form="availability-form"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !isFormValid}>
            <span>Mark as Complete</span>
            <CircleCheck className="w-5 h-5 text-gray-700" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="relative border border-gray-300 rounded-2xl bg-[#F0F3FC] p-2 pl-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("weeklyHours")}
            className={`pb-2 px-4  transition-colors cursor-pointer relative ${
              activeTab === "weeklyHours"
                ? "text-black font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Weekly Hours
            {activeTab === "weeklyHours" && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button>
          {/* <button
            type="button"
            onClick={() => setActiveTab("overrideHours")}
            className={`pb-2 px-4 transition-colors cursor-pointer relative ${
              activeTab === "overrideHours"
                ? "text-black font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Override Hours
            {activeTab === "overrideHours" && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button> */}
          <button
            type="button"
            onClick={() => setActiveTab("bookingOptions")}
            className={`pb-2 px-4 transition-colors cursor-pointer relative ${
              activeTab === "bookingOptions"
                ? "text-black font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Additional Preferences
            {activeTab === "bookingOptions" && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button>
        </div>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="availability-form">
        {/* Weekly Hours Tab */}
        {activeTab === "weeklyHours" && <WeeklyHours form={form} />}

        {/* Override Hours Tab */}
        {/* {activeTab === "overrideHours" && <OverrideHours form={form} />} */}

        {/* Booking Options Tab */}
        {activeTab === "bookingOptions" && <BookingOptions form={form} />}
      </FormProvider>
    </div>
  );
};

export default AvailabilityPreferencesForm;
