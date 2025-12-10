"use client";
import React from "react";
import { UseFormReturn } from "@/lib/form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";
import { FormField } from "@/components/form";
import { Calendar, Clock } from "lucide-react";
import {
  MAX_IMES_PER_WEEK_OPTIONS,
  MINIMUM_NOTICE_OPTIONS,
} from "../../../constants/options";

interface BookingOptionsProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const BookingOptions: React.FC<BookingOptionsProps> = ({ form: _form }) => {
  return (
    <div className="mt-2 pl-3 py-6">
      <div className="w-full md:max-w-[50%] border border-gray-300 rounded-lg p-6 bg-[#FCFDFF]">
        <div className="space-y-1">
          {/* Maximum IMEs per week */}
          <FormField name="bookingOptions.maxIMEsPerWeek" required>
            {(field) => (
              <div className="flex items-center justify-between gap-4 relative py-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00A8FF] shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    Maximum IMEs per week
                  </span>
                </div>
                <div className="flex flex-col">
                  <select
                    {...field}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[180px]">
                    <option value="">Select maximum</option>
                    {MAX_IMES_PER_WEEK_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </FormField>

          {/* Minimum notice required */}
          <FormField name="bookingOptions.minimumNotice" required>
            {(field) => (
              <div className="flex items-center justify-between gap-4 relative py-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#00A8FF] shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    Minimum notice required
                  </span>
                </div>
                <div className="flex flex-col">
                  <select
                    {...field}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[180px]">
                    <option value="">Select notice</option>
                    {MINIMUM_NOTICE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default BookingOptions;
