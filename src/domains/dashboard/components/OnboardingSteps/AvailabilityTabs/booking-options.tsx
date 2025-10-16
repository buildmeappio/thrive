"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";
import { bufferTimeOptions, advanceBookingOptions } from "../../../constants";

interface BookingOptionsProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const BookingOptions: React.FC<BookingOptionsProps> = ({ form }) => {
  return (
    <div className="space-y-6 py-6 pl-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buffer Time Between Appointments
        </label>
        <select
          {...form.register("bookingOptions.bufferTime")}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-full max-w-xs">
          {bufferTimeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Advance Booking Window
        </label>
        <select
          {...form.register("bookingOptions.advanceBooking")}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-full max-w-xs">
          {advanceBookingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BookingOptions;
