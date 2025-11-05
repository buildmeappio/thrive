"use client";
import React from "react";
import { UseFormReturn } from "@/lib/form";
import { AvailabilityPreferencesInput } from "../../../schemas/onboardingSteps.schema";
import { FormField } from "@/components/form";
import { CalendarPlus, Clock, Users, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface BookingOptionsProps {
  form: UseFormReturn<AvailabilityPreferencesInput>;
}

const appointmentDurationOptions = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
  { value: "120", label: "120 minutes" },
];

const bufferOptions = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "60 minutes" },
];

const minimumNoticeUnitOptions = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

const BookingOptions: React.FC<BookingOptionsProps> = ({ form }) => {
  const appointmentTypes = form.watch("bookingOptions.appointmentTypes") || [];
  const minimumNotice = form.watch("bookingOptions.minimumNotice") || {
    value: 5,
    unit: "hours",
  };

  const handleAppointmentTypeChange = (
    type: "phone" | "video",
    checked: boolean
  ) => {
    const currentTypes =
      form.getValues("bookingOptions.appointmentTypes") || [];
    if (checked) {
      if (!currentTypes.includes(type)) {
        form.setValue("bookingOptions.appointmentTypes", [
          ...currentTypes,
          type,
        ]);
      }
    } else {
      form.setValue(
        "bookingOptions.appointmentTypes",
        currentTypes.filter((t) => t !== type)
      );
    }
  };

  return (
    <div className="mt-6 pl-3 py-6">
      <div className="w-full md:max-w-[50%] border border-gray-300 rounded-lg p-6 bg-[#FCFDFF]">
        <div className="space-y-1">
          {/* Appointment Type */}
          <FormField
            name="bookingOptions.appointmentTypes"
            label="Appointment Type"
            required>
            {(_field) => (
              <div className="flex items-start justify-between gap-4 relative py-2">
                <div className="flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-[#00A8FF] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    Appointment Type
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={appointmentTypes.includes("phone")}
                        onCheckedChange={(checked) =>
                          handleAppointmentTypeChange(
                            "phone",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-gray-800">Phone Call</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={appointmentTypes.includes("video")}
                        onCheckedChange={(checked) =>
                          handleAppointmentTypeChange(
                            "video",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-gray-800">Video</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </FormField>

          {/* Appointment Duration */}
          <FormField
            name="bookingOptions.appointmentDuration"
            label="Appointment Duration"
            required>
            {(field) => (
              <div className="flex items-center justify-between gap-4 relative py-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#00A8FF] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    Appointment Duration
                  </span>
                </div>
                <div className="flex flex-col">
                  <select
                    {...field}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[180px]">
                    <option value="">Select duration</option>
                    {appointmentDurationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </FormField>

          {/* Buffer */}
          <FormField name="bookingOptions.buffer" label="Buffer" required>
            {(field) => (
              <div className="flex items-center justify-between gap-4 relative py-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00A8FF] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    Buffer
                  </span>
                </div>
                <div className="flex flex-col">
                  <select
                    {...field}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] min-w-[180px]">
                    <option value="">Select buffer time</option>
                    {bufferOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </FormField>

          {/* Booking Window */}
          <FormField
            name="bookingOptions.bookingWindow"
            label="Booking Window"
            required>
            {(_field) => (
              <div className="flex items-center justify-between gap-4 relative py-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00A8FF] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    Booking Window
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.watch("bookingOptions.bookingWindow") || ""}
                    onChange={(e) =>
                      form.setValue(
                        "bookingOptions.bookingWindow",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-24"
                    min="1"
                    placeholder="60"
                  />
                  <span className="text-sm text-gray-800">
                    Days in to the future
                  </span>
                </div>
              </div>
            )}
          </FormField>

          {/* Minimum Notice */}
          <FormField
            name="bookingOptions.minimumNotice"
            label="Minimum Notice"
            required>
            {(_field) => (
              <div className="flex items-center justify-between gap-4 relative py-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#00A8FF] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800">
                    Minimum Notice
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minimumNotice.value || ""}
                    onChange={(e) =>
                      form.setValue("bookingOptions.minimumNotice", {
                        ...minimumNotice,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] w-24"
                    min="1"
                    placeholder="5"
                  />
                  <select
                    value={minimumNotice.unit || "hours"}
                    onChange={(e) =>
                      form.setValue("bookingOptions.minimumNotice", {
                        ...minimumNotice,
                        unit: e.target.value as "hours" | "days",
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]">
                    {minimumNoticeUnitOptions.map((option) => (
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
