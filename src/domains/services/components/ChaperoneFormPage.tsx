"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import WeeklyHoursSection from "./WeeklyHoursSection";
import OverrideHoursSection from "./OverrideHoursSection";
import {
  CreateChaperoneInput,
  UpdateChaperoneInput,
  ChaperoneWithAvailability,
} from "../types/Chaperone";
import { WeeklyHours, OverrideHours, Weekday } from "../types/Availability";
import { ChaperoneFormData, chaperoneFormSchema } from "../schemas/chaperones";
import PhoneInput from "@/components/PhoneNumber";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type ChaperoneFormPageProps = {
  mode: "create" | "edit";
  chaperone?: ChaperoneWithAvailability;
  onSubmit: (
    data: CreateChaperoneInput | UpdateChaperoneInput,
  ) => Promise<void>;
};

// Default weekly hours - Monday to Friday enabled by default, Saturday and Sunday disabled
const getDefaultWeeklyHours = (): WeeklyHours[] => {
  const days: Weekday[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days.map((day) => ({
    dayOfWeek: day,
    enabled: day !== "SUNDAY" && day !== "SATURDAY", // Enable Monday-Friday
    timeSlots:
      day !== "SUNDAY" && day !== "SATURDAY"
        ? [{ startTime: "8:00 AM", endTime: "5:00 PM" }]
        : [],
  }));
};

const ChaperoneFormPage: React.FC<ChaperoneFormPageProps> = ({
  mode,
  chaperone,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<"weekly" | "override">("weekly");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize weekly hours - merge existing data with default structure
  const initializeWeeklyHours = (): WeeklyHours[] => {
    const defaults = getDefaultWeeklyHours();
    if (!chaperone?.availability?.weeklyHours) return defaults;

    return defaults.map((defaultDay) => {
      const existingDay = chaperone.availability!.weeklyHours!.find(
        (wh) => wh.dayOfWeek === defaultDay.dayOfWeek,
      );
      return existingDay || defaultDay;
    });
  };

  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours[]>(
    initializeWeeklyHours(),
  );

  const [overrideHours, setOverrideHours] = useState<OverrideHours[]>(
    chaperone?.availability?.overrideHours || [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<ChaperoneFormData>({
    resolver: zodResolver(chaperoneFormSchema),
    defaultValues: {
      firstName: chaperone?.firstName || "",
      lastName: chaperone?.lastName || "",
      email: chaperone?.email || "",
      phone: chaperone?.phone || "",
      gender: chaperone?.gender || "",
    },
  });

  const phone = watch("phone");
  const firstNameValue = watch("firstName");
  const lastNameValue = watch("lastName");

  // Sanitize name input: remove special characters, prevent leading spaces, collapse multiple spaces
  const sanitizeNameInput = (value: string) => {
    const noSpecialCharacters = value.replace(/[^a-zA-Z\s]/g, "");
    const noLeadingSpaces = noSpecialCharacters.replace(/^\s+/g, "");
    return noLeadingSpaces.replace(/\s+/g, " ");
  };

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let hour24 = hours;
    if (period === "PM" && hours !== 12) hour24 += 12;
    if (period === "AM" && hours === 12) hour24 = 0;

    return hour24 * 60 + minutes;
  };

  // Validate time slots for overlaps and invalid ranges
  const validateTimeSlots = (): { isValid: boolean; errorMessage?: string } => {
    // Check weekly hours
    for (const dayHours of weeklyHours) {
      if (!dayHours.enabled || dayHours.timeSlots.length === 0) continue;

      for (let i = 0; i < dayHours.timeSlots.length; i++) {
        const slot = dayHours.timeSlots[i];
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        // Check if start time is greater than or equal to end time
        if (startMinutes >= endMinutes) {
          return {
            isValid: false,
            errorMessage: `Invalid time range in ${dayHours.dayOfWeek}: Start time must be before end time`,
          };
        }

        // Check for overlaps with other slots on the same day
        for (let j = i + 1; j < dayHours.timeSlots.length; j++) {
          const otherSlot = dayHours.timeSlots[j];
          const otherStartMinutes = timeToMinutes(otherSlot.startTime);
          const otherEndMinutes = timeToMinutes(otherSlot.endTime);

          const hasOverlap =
            (startMinutes >= otherStartMinutes &&
              startMinutes < otherEndMinutes) ||
            (endMinutes > otherStartMinutes && endMinutes <= otherEndMinutes) ||
            (startMinutes <= otherStartMinutes &&
              endMinutes >= otherEndMinutes);

          if (hasOverlap) {
            return {
              isValid: false,
              errorMessage: `Overlapping time slots in ${dayHours.dayOfWeek}`,
            };
          }
        }
      }
    }

    // Check override hours
    for (const dateHours of overrideHours) {
      for (let i = 0; i < dateHours.timeSlots.length; i++) {
        const slot = dateHours.timeSlots[i];
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        // Check if start time is greater than or equal to end time
        if (startMinutes >= endMinutes) {
          return {
            isValid: false,
            errorMessage: `Invalid time range in override date ${dateHours.date}: Start time must be before end time`,
          };
        }

        // Check for overlaps with other slots on the same date
        for (let j = i + 1; j < dateHours.timeSlots.length; j++) {
          const otherSlot = dateHours.timeSlots[j];
          const otherStartMinutes = timeToMinutes(otherSlot.startTime);
          const otherEndMinutes = timeToMinutes(otherSlot.endTime);

          const hasOverlap =
            (startMinutes >= otherStartMinutes &&
              startMinutes < otherEndMinutes) ||
            (endMinutes > otherStartMinutes && endMinutes <= otherEndMinutes) ||
            (startMinutes <= otherStartMinutes &&
              endMinutes >= otherEndMinutes);

          if (hasOverlap) {
            return {
              isValid: false,
              errorMessage: `Overlapping time slots in override date ${dateHours.date}`,
            };
          }
        }
      }
    }

    return { isValid: true };
  };

  const handleFormSubmit = async (data: ChaperoneFormData) => {
    try {
      // Additional validation for names (double-check after zod validation)
      const cleanFirstName = data.firstName.trim();
      const cleanLastName = data.lastName.trim();

      // Validate first name
      if (!cleanFirstName || cleanFirstName.length === 0) {
        setError("firstName", {
          type: "manual",
          message: "First name is required",
        });
        return;
      }

      if (!/^[A-Za-z][A-Za-z\s]*$/.test(cleanFirstName)) {
        setError("firstName", {
          type: "manual",
          message:
            "First name must start with a letter and contain only letters and spaces",
        });
        return;
      }

      // Validate last name
      if (!cleanLastName || cleanLastName.length === 0) {
        setError("lastName", {
          type: "manual",
          message: "Last name is required",
        });
        return;
      }

      if (!/^[A-Za-z][A-Za-z\s]*$/.test(cleanLastName)) {
        setError("lastName", {
          type: "manual",
          message:
            "Last name must start with a letter and contain only letters and spaces",
        });
        return;
      }

      // Validate time slots before submission
      const validation = validateTimeSlots();
      if (!validation.isValid) {
        toast.error(
          validation.errorMessage ||
            "Please fix time slot errors before submitting",
        );
        return;
      }

      setIsSubmitting(true);

      // Filter only enabled days for weekly hours
      const enabledWeeklyHours = weeklyHours.filter(
        (wh) => wh.enabled && wh.timeSlots.length > 0,
      );

      const submitData: CreateChaperoneInput | UpdateChaperoneInput = {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: data.email.trim(),
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        availability: {
          weeklyHours: enabledWeeklyHours,
          overrideHours: overrideHours,
        },
      };

      await onSubmit(submitData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to ${mode} chaperone`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/chaperones"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </Link>
        <div>
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
            {mode === "create" ? "Add New Chaperone" : "Edit Chaperone"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-black font-poppins">
              Basic Information
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstNameValue}
                  {...register("firstName", {
                    onChange: (event) => {
                      const sanitized = sanitizeNameInput(event.target.value);
                      setValue("firstName", sanitized, {
                        shouldValidate: true,
                      });
                    },
                    onBlur: (event) => {
                      const trimmedValue = event.target.value.trim();
                      if (trimmedValue !== event.target.value) {
                        setValue("firstName", trimmedValue, {
                          shouldValidate: true,
                        });
                      }
                    },
                  })}
                  placeholder="Enter first name"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    // Prevent space at the beginning
                    if (
                      e.key === " " &&
                      e.currentTarget.selectionStart === 0 &&
                      e.currentTarget.value.trim().length === 0
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastNameValue}
                  {...register("lastName", {
                    onChange: (event) => {
                      const sanitized = sanitizeNameInput(event.target.value);
                      setValue("lastName", sanitized, { shouldValidate: true });
                    },
                    onBlur: (event) => {
                      const trimmedValue = event.target.value.trim();
                      if (trimmedValue !== event.target.value) {
                        setValue("lastName", trimmedValue, {
                          shouldValidate: true,
                        });
                      }
                    },
                  })}
                  placeholder="Enter last name"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    // Prevent space at the beginning
                    if (
                      e.key === " " &&
                      e.currentTarget.selectionStart === 0 &&
                      e.currentTarget.value.trim().length === 0
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <PhoneInput
                  name="phone"
                  value={phone || ""}
                  onChange={(e) =>
                    setValue("phone", e.target.value, { shouldValidate: true })
                  }
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2 w-1/4">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  {...register("gender")}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-black font-poppins">
              Availability
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-200 bg-gray-50 px-6">
            <button
              type="button"
              onClick={() => setActiveTab("weekly")}
              className={`px-6 py-4 font-poppins font-medium text-base transition-all duration-200 relative ${
                activeTab === "weekly"
                  ? "text-black bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Weekly Hours
              {activeTab === "weekly" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("override")}
              className={`px-6 py-4 font-poppins font-medium text-base transition-all duration-200 relative ${
                activeTab === "override"
                  ? "text-black bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Override Hours
              {activeTab === "override" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "weekly" ? (
              <WeeklyHoursSection
                weeklyHours={weeklyHours}
                onChange={setWeeklyHours}
                disabled={isSubmitting}
              />
            ) : (
              <OverrideHoursSection
                overrideHours={overrideHours}
                onChange={setOverrideHours}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/chaperones">
            <Button
              className="h-[45px] w-[100px] rounded-full cursor-pointer"
              type="button"
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[45px] w-[160px] cursor-pointer rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]"
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create Chaperone"
                : "Update Chaperone"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChaperoneFormPage;
