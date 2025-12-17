"use client";

import React, { useState } from "react";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { cn } from "@/lib/utils";
import { TransporterData } from "../types/TransporterData";
import { updateTransporter, deleteTransporter } from "../server";
import { Check, Edit, X, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import PhoneInput from "@/components/PhoneNumber";
import { capitalizeWords } from "@/utils/text";
import { provinceOptions } from "@/constants/options";
import { TRANSPORTER_STATUSES } from "../types/TransporterData";
import { TransporterFormHandler } from "../server/handlers/transporterForm.handler";
import {
  AvailabilityTabs,
  WeeklyHoursState,
  OverrideHoursState,
  weeklyStateToArray,
  weeklyArrayToState,
  overrideStateToArray,
  overrideArrayToState,
  overrideDateToLocalDate,
  formatOverrideDisplayDate,
} from "@/components/availability";
import { format } from "date-fns";
import { saveTransporterAvailabilityAction } from "../server/actions/saveAvailability";
import { useRouter } from "next/navigation";
import { showDeleteConfirmation } from "@/components";
import Link from "next/link";
import logger from "@/utils/logger";

const mapStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

type Props = {
  transporter: TransporterData;
  initialAvailability: {
    weeklyHours: WeeklyHoursState;
    overrideHours: OverrideHoursState;
  } | null;
};

const getDefaultWeeklyHours = (): WeeklyHoursState => ({
  sunday: {
    enabled: false,
    timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
  },
  monday: {
    enabled: true,
    timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
  },
  tuesday: {
    enabled: true,
    timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
  },
  wednesday: {
    enabled: true,
    timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
  },
  thursday: {
    enabled: true,
    timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
  },
  friday: {
    enabled: true,
    timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
  },
  saturday: {
    enabled: false,
    timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
  },
});

export default function TransporterDetail({
  transporter,
  initialAvailability,
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: transporter.companyName,
    contactPerson: transporter.contactPerson,
    phone: transporter.phone,
    email: transporter.email,
    status: transporter.status,
    serviceAreas: transporter.serviceAreas || [],
  });
  const hasAvailability = initialAvailability !== null;
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursState>(
    initialAvailability?.weeklyHours || getDefaultWeeklyHours(),
  );
  const [overrideHours, setOverrideHours] = useState<OverrideHoursState>(
    initialAvailability?.overrideHours || [],
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate and sanitize form data using the handler
      const validation =
        TransporterFormHandler.validateAndSanitizeFormData(formData);

      if (!validation.isValid) {
        toast.error(validation.errors[0]); // Show first error
        setIsLoading(false);
        return;
      }

      const updateData = {
        ...validation.sanitizedData!,
        phone: formData.phone.trim() || undefined,
        status: formData.status, // Include the status field
      };

      logger.log("Updating transporter with data:", updateData);

      const result = await updateTransporter(transporter.id, updateData);
      if (result.success) {
        await saveTransporterAvailabilityAction({
          transporterId: transporter.id,
          weeklyHours,
          overrideHours,
        } as any);
        toast.success("Transporter updated successfully");
        setIsEditing(false);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update transporter");
      }
    } catch (error) {
      toast.error("An error occurred while updating transporter", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      companyName: transporter.companyName,
      contactPerson: transporter.contactPerson,
      phone: transporter.phone,
      email: transporter.email,
      status: transporter.status,
      serviceAreas: transporter.serviceAreas || [],
    });
    // Reset availability to initial state
    setWeeklyHours(initialAvailability?.weeklyHours || getDefaultWeeklyHours());
    setOverrideHours(initialAvailability?.overrideHours || []);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    showDeleteConfirmation(transporter.companyName, async () => {
      setIsDeleting(true);
      try {
        const result = await deleteTransporter(transporter.id);
        if (result.success) {
          toast.success("Transporter deleted successfully");
          router.push("/transporter");
        } else {
          toast.error(result.error || "Failed to delete transporter");
        }
      } catch (error) {
        toast.error("An error occurred while deleting transporter", error);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const toggleProvince = (province: string) => {
    setFormData((prev) => {
      const existingAreas = prev.serviceAreas || [];
      const existingProvince = existingAreas.find(
        (area) => area.province === province,
      );

      if (existingProvince) {
        // Remove the province
        return {
          ...prev,
          serviceAreas: existingAreas.filter(
            (area) => area.province !== province,
          ),
        };
      } else {
        // Add the province
        return {
          ...prev,
          serviceAreas: [...existingAreas, { province, address: "" }],
        };
      }
    });
  };

  // Validation handlers
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = TransporterFormHandler.handleCompanyNameChange(
      e.target.value,
    );
    setFormData((prev) => ({ ...prev, companyName: sanitizedValue }));
  };

  const handleCompanyNameBlur = () => {
    const trimmedValue = TransporterFormHandler.handleCompanyNameBlur(
      formData.companyName,
    );
    setFormData((prev) => ({ ...prev, companyName: trimmedValue }));
  };

  const handleContactPersonChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const sanitizedValue = TransporterFormHandler.handleContactPersonChange(
      e.target.value,
    );
    setFormData((prev) => ({ ...prev, contactPerson: sanitizedValue }));
  };

  const handleContactPersonBlur = () => {
    const trimmedValue = TransporterFormHandler.handleContactPersonBlur(
      formData.contactPerson,
    );
    setFormData((prev) => ({ ...prev, contactPerson: trimmedValue }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = TransporterFormHandler.handleEmailChange(
      e.target.value,
    );
    setFormData((prev) => ({ ...prev, email: sanitizedValue }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault(); // Prevent spacebar from being typed
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phone: e.target.value }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href="/transporter"
            className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {capitalizeWords(transporter.companyName)}
            </h1>
          </Link>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isEditing ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-green-600 shadow-sm text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex-1 sm:flex-initial"
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-gray-500 shadow-sm text-white rounded-lg hover:bg-gray-600 flex-1 sm:flex-initial"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors text-sm sm:text-base flex-1 sm:flex-initial"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-initial"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-sm font-medium">
                  {isDeleting ? "Deleting..." : "Delete"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layout - Changes based on edit mode */}
      {isEditing ? (
        // Edit Mode: Single column layout with everything stacked
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <Section title="Basic Information">
              <div className="space-y-4">
                <FieldRow
                  label="Company Name *"
                  type="text"
                  value={
                    <div>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={handleCompanyNameChange}
                        onBlur={handleCompanyNameBlur}
                        maxLength={25}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                          TransporterFormHandler.isOnlySpaces(
                            formData.companyName,
                          )
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#00A8FF]",
                        )}
                        placeholder="Enter company name (alphabets only, max 25)"
                      />
                      {TransporterFormHandler.isOnlySpaces(
                        formData.companyName,
                      ) && (
                        <p className="text-xs text-red-500 mt-1">
                          Company name cannot be only spaces
                        </p>
                      )}
                    </div>
                  }
                />
                <FieldRow
                  label="Contact Person *"
                  type="text"
                  value={
                    <div>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={handleContactPersonChange}
                        onBlur={handleContactPersonBlur}
                        maxLength={25}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                          TransporterFormHandler.isOnlySpaces(
                            formData.contactPerson,
                          )
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#00A8FF]",
                        )}
                        placeholder="Enter contact person name (alphabets only, max 25)"
                      />
                      {TransporterFormHandler.isOnlySpaces(
                        formData.contactPerson,
                      ) && (
                        <p className="text-xs text-red-500 mt-1">
                          Contact person cannot be only spaces
                        </p>
                      )}
                    </div>
                  }
                />
                <FieldRow
                  label="Email *"
                  type="text"
                  value={
                    <div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        onKeyDown={handleEmailKeyDown}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                          formData.email &&
                            !TransporterFormHandler.isValidEmail(formData.email)
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#00A8FF]",
                        )}
                        placeholder="Enter email address"
                      />
                      {formData.email &&
                        !TransporterFormHandler.isValidEmail(
                          formData.email,
                        ) && (
                          <p className="text-xs text-red-500 mt-1">
                            Please enter a valid email address
                          </p>
                        )}
                    </div>
                  }
                />
                <FieldRow
                  label="Phone *"
                  type="text"
                  value={
                    <PhoneInput
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full"
                    />
                  }
                />
              </div>
            </Section>

            {/* Availability */}
            <AvailabilityTabs
              weeklyHours={weeklyStateToArray(weeklyHours)}
              overrideHours={overrideStateToArray(overrideHours)}
              onWeeklyHoursChange={(updated) =>
                setWeeklyHours(weeklyArrayToState(updated))
              }
              onOverrideHoursChange={(updated) =>
                setOverrideHours(overrideArrayToState(updated))
              }
              disabled={!isEditing}
            />

            {/* Service Provinces - Below Availability in Edit Mode */}
            <Section title="Service Provinces">
              <div className="space-y-4 min-w-0 w-full">
                <div className="min-w-0 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Provinces <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2 border border-gray-200 rounded-lg p-3 min-w-0 w-full max-h-64 overflow-y-auto">
                    {provinceOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer min-w-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceAreas.some(
                            (area) => area.province === option.value,
                          )}
                          onChange={() => toggleProvince(option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-base min-w-0 truncate">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.serviceAreas.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected provinces:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.serviceAreas.map((area) => (
                          <span
                            key={area.province}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {
                              provinceOptions.find(
                                (p) => p.value === area.province,
                              )?.label
                            }
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Status Management - Below Service Provinces in Edit Mode */}
            <Section title="Status Management">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRANSPORTER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </Section>
          </div>
        </div>
      ) : (
        <>
          {/* View Mode: Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6 lg:gap-8 bg-white rounded-lg p-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6 min-w-0 w-full">
              <Section title="Basic Information">
                <div className="space-y-4">
                  <FieldRow
                    label="Company Name"
                    type="text"
                    value={capitalizeWords(transporter.companyName)}
                  />
                  <FieldRow
                    label="Contact Person"
                    type="text"
                    value={capitalizeWords(transporter.contactPerson)}
                  />
                  <FieldRow
                    label="Email"
                    type="text"
                    value={transporter.email}
                  />
                  <FieldRow
                    label="Phone"
                    type="text"
                    value={formatPhoneNumber(transporter.phone)}
                  />
                </div>
              </Section>
            </div>

            {/* Right Column - Service Provinces */}
            <div className="space-y-6 min-w-0 w-full max-w-full">
              <Section title="Service Provinces">
                <div className="space-y-2">
                  {(transporter.serviceAreas || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(transporter.serviceAreas || []).map((area) => (
                        <span
                          key={area.province}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {provinceOptions.find(
                            (p) => p.value === area.province,
                          )?.label || area.province}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No provinces selected
                    </p>
                  )}
                </div>
              </Section>

              {/* Status Management - Bottom Right */}
              <Section title="Status Management">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Current Status:
                  </span>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      mapStatus[transporter.status] === "active" &&
                        "bg-green-100 text-green-800",
                      mapStatus[transporter.status] === "suspended" &&
                        "bg-red-100 text-red-800",
                    )}
                  >
                    {transporter.status === "ACTIVE" && "Active"}
                    {transporter.status === "SUSPENDED" && "Suspended"}
                  </span>
                </div>
              </Section>
            </div>
          </div>

          {/* Availability - Separate Card in View Mode */}
          {hasAvailability && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-black font-poppins">
                  Availability
                </h2>
              </div>
              <div className="p-6">
                {(() => {
                  const weeklyHoursArray = weeklyStateToArray(weeklyHours);
                  const overrideHoursArray =
                    overrideStateToArray(overrideHours);
                  const hasWeeklyHours =
                    weeklyHoursArray.filter((wh) => wh.enabled).length > 0;
                  const hasOverrideHours = overrideHoursArray.length > 0;

                  return (
                    <>
                      {/* Weekly Hours */}
                      {hasWeeklyHours && (
                        <div className="mb-8">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-[#00A8FF] to-[#01F4C8] rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                              Weekly Schedule
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {weeklyHoursArray
                              .filter((wh) => wh.enabled)
                              .map((wh) => (
                                <div
                                  key={wh.id || wh.dayOfWeek}
                                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full"></div>
                                    <p className="font-poppins font-semibold text-gray-900 text-base">
                                      {wh.dayOfWeek.charAt(0) +
                                        wh.dayOfWeek.slice(1).toLowerCase()}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    {wh.timeSlots.map((slot, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2"
                                      >
                                        <svg
                                          className="w-4 h-4 text-[#00A8FF]"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        <p className="text-sm text-gray-700 font-poppins font-medium">
                                          {slot.startTime} - {slot.endTime}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Override Hours */}
                      {hasOverrideHours && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-[#FF6B6B] to-[#FFA500] rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                              Special Dates
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {overrideHoursArray.map((oh) => (
                              <div
                                key={oh.id || oh.date}
                                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <svg
                                    className="w-5 h-5 text-orange-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <p className="font-poppins font-semibold text-gray-900 text-base">
                                    {(() => {
                                      const localDate = overrideDateToLocalDate(
                                        oh.date,
                                      );
                                      return localDate
                                        ? format(
                                            localDate,
                                            "EEEE, MMM dd, yyyy",
                                          )
                                        : formatOverrideDisplayDate(oh.date);
                                    })()}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {oh.timeSlots.map((slot, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2"
                                    >
                                      <svg
                                        className="w-4 h-4 text-orange-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      <p className="text-sm text-gray-700 font-poppins font-medium">
                                        {slot.startTime} - {slot.endTime}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasWeeklyHours && !hasOverrideHours && (
                        <div className="text-center py-12">
                          <svg
                            className="w-16 h-16 mx-auto text-gray-300 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-gray-500 font-poppins text-lg">
                            No availability set
                          </p>
                          <p className="text-gray-400 font-poppins text-sm mt-1">
                            Schedule has not been configured yet
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
