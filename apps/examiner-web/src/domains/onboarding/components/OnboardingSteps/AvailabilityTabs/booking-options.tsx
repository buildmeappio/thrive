"use client";
import React from "react";
import { UseFormReturn, Controller } from "@/lib/form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";
import { useFormContext } from "@/lib/form";
import { Calendar, Clock } from "lucide-react";
import {
  MAX_IMES_PER_WEEK_OPTIONS,
  MINIMUM_NOTICE_OPTIONS,
} from "../../../constants/options";

interface BookingOptionsProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const BookingOptions: React.FC<BookingOptionsProps> = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<AvailabilityPreferencesInput>();

  const maxIMEsError = errors.bookingOptions?.maxIMEsPerWeek;
  const minimumNoticeError = errors.bookingOptions?.minimumNotice;

  const formValues = useFormContext<AvailabilityPreferencesInput>().watch();
  const maxValue = formValues.bookingOptions?.maxIMEsPerWeek;
  const noticeValue = formValues.bookingOptions?.minimumNotice;

  return (
    <div className="mt-2 pl-3 py-6">
      <div className="w-full md:max-w-[50%] border border-gray-300 rounded-lg p-6 bg-[#FCFDFF]">
        <div className="space-y-1">
          {/* Maximum IMEs per week */}
          <div className="flex items-center justify-between gap-4 relative py-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00A8FF] shrink-0" />
              <span className="text-sm font-medium text-gray-800">
                Maximum IMEs per week<span className="text-red-500">*</span>
              </span>
            </div>
            <div className="flex flex-col">
              <Controller
                name="bookingOptions.maxIMEsPerWeek"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Don't save empty string (placeholder) as a value - convert to empty string for form state
                      // Validation will prevent empty strings from being submitted
                      field.onChange(value === "" ? "" : value);
                    }}
                    onBlur={field.onBlur}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[180px]"
                    style={{
                      color: !field.value ? "#9CA3AF" : undefined,
                    }}
                  >
                    {!maxValue && (
                      <option value="" disabled>
                        Select maximum
                      </option>
                    )}
                    {MAX_IMES_PER_WEEK_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {maxIMEsError && (
                <p className="text-xs text-red-500 mt-1">
                  {maxIMEsError.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Minimum notice required */}
          <div className="flex items-center justify-between gap-4 relative py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00A8FF] shrink-0" />
              <span className="text-sm font-medium text-gray-800">
                Minimum notice required<span className="text-red-500">*</span>
              </span>
            </div>
            <div className="flex flex-col">
              <Controller
                name="bookingOptions.minimumNotice"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Don't save empty string (placeholder) as a value - convert to empty string for form state
                      // Validation will prevent empty strings from being submitted
                      field.onChange(value === "" ? "" : value);
                    }}
                    onBlur={field.onBlur}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[180px]"
                    style={{
                      color: !field.value ? "#9CA3AF" : undefined,
                    }}
                  >
                    {!noticeValue && (
                      <option value="" disabled>
                        Select notice
                      </option>
                    )}
                    {MINIMUM_NOTICE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {minimumNoticeError && (
                <p className="text-xs text-red-500 mt-1">
                  {minimumNoticeError.message as string}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingOptions;
