"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";

interface BookingOptionsProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const BookingOptions: React.FC<BookingOptionsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buffer Time Between Appointments
        </label>
        <select
          {...form.register("bookingOptions.bufferTime")}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-full max-w-xs">
          <option value="0">No buffer</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Advance Booking Window
        </label>
        <select
          {...form.register("bookingOptions.advanceBooking")}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-full max-w-xs">
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
        </select>
      </div>
    </div>
  );
};

export default BookingOptions;
