"use client";

import React, { useState } from "react";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { cn } from "@/lib/utils";
import { TransporterData } from "../types/TransporterData";
import { updateTransporter, deleteTransporter } from "../server";
import { Check, Edit, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords } from "@/utils/text";
import { provinceOptions } from "@/constants/options";
import { TRANSPORTER_STATUSES } from "../types/TransporterData";
import { TransporterFormHandler } from "../server";
import { WeeklyHours, OverrideHours, WeeklyHoursState, OverrideHoursState } from "@/components/availability";
import { getTransporterAvailabilityAction, saveTransporterAvailabilityAction } from "../server";
import { useRouter } from "next/navigation";
import { showDeleteConfirmation } from "@/components";

const mapStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

type Props = { transporter: TransporterData };

export default function TransporterDetail({ transporter }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"weeklyHours" | "overrideHours">("weeklyHours");
  const [formData, setFormData] = useState({
    companyName: transporter.companyName,
    contactPerson: transporter.contactPerson,
    phone: transporter.phone,
    email: transporter.email,
    status: transporter.status,
    serviceAreas: transporter.serviceAreas || [],
  });
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursState>({
    sunday: { enabled: false, timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }] },
    monday: { enabled: true, timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }] },
    tuesday: { enabled: true, timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }] },
    wednesday: { enabled: true, timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }] },
    thursday: { enabled: true, timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }] },
    friday: { enabled: true, timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }] },
    saturday: { enabled: false, timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }] },
  });
  const [overrideHours, setOverrideHours] = useState<OverrideHoursState>([]);

  React.useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        const res = await getTransporterAvailabilityAction({ transporterId: transporter.id } as any);
        if ((res as any)?.success && (res as any).data) {
          setWeeklyHours((res as any).data.weeklyHours);
          setOverrideHours((res as any).data.overrideHours);
        }
      } catch (e) {
        console.error("Failed to fetch availability", e);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchAvailability();
  }, [transporter.id]);

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

      console.log("Updating transporter with data:", updateData);

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
        (area) => area.province === province
      );

      if (existingProvince) {
        // Remove the province
        return {
          ...prev,
          serviceAreas: existingAreas.filter(
            (area) => area.province !== province
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
      e.target.value
    );
    setFormData((prev) => ({ ...prev, companyName: sanitizedValue }));
  };

  const handleCompanyNameBlur = () => {
    const trimmedValue = TransporterFormHandler.handleCompanyNameBlur(
      formData.companyName
    );
    setFormData((prev) => ({ ...prev, companyName: trimmedValue }));
  };

  const handleContactPersonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const sanitizedValue = TransporterFormHandler.handleContactPersonChange(
      e.target.value
    );
    setFormData((prev) => ({ ...prev, contactPerson: sanitizedValue }));
  };

  const handleContactPersonBlur = () => {
    const trimmedValue = TransporterFormHandler.handleContactPersonBlur(
      formData.contactPerson
    );
    setFormData((prev) => ({ ...prev, contactPerson: trimmedValue }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = TransporterFormHandler.handleEmailChange(
      e.target.value
    );
    setFormData((prev) => ({ ...prev, email: sanitizedValue }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault(); // Prevent spacebar from being typed
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = TransporterFormHandler.handlePhoneChange(
      e.target.value
    );
    setFormData((prev) => ({ ...prev, phone: sanitizedValue }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {capitalizeWords(transporter.companyName)}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 shadow-sm text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                <Check className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 shadow-sm text-white rounded-lg hover:bg-gray-600">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80 text-white rounded-lg">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 shadow-sm text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg p-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <Section title="Basic Information">
            <div className="space-y-4">
              <FieldRow
                label="Company Name *"
                type="text"
                value={
                  isEditing ? (
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
                            formData.companyName
                          )
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#00A8FF]"
                        )}
                        placeholder="Enter company name (alphabets only, max 25)"
                      />
                      {TransporterFormHandler.isOnlySpaces(
                        formData.companyName
                      ) && (
                        <p className="text-xs text-red-500 mt-1">
                          Company name cannot be only spaces
                        </p>
                      )}
                    </div>
                  ) : (
                    capitalizeWords(transporter.companyName)
                  )
                }
              />
              <FieldRow
                label="Contact Person *"
                type="text"
                value={
                  isEditing ? (
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
                            formData.contactPerson
                          )
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#00A8FF]"
                        )}
                        placeholder="Enter contact person name (alphabets only, max 25)"
                      />
                      {TransporterFormHandler.isOnlySpaces(
                        formData.contactPerson
                      ) && (
                        <p className="text-xs text-red-500 mt-1">
                          Contact person cannot be only spaces
                        </p>
                      )}
                    </div>
                  ) : (
                    capitalizeWords(transporter.contactPerson)
                  )
                }
              />
              <FieldRow
                label="Email *"
                type="text"
                value={
                  isEditing ? (
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
                            : "border-gray-300 focus:ring-[#00A8FF]"
                        )}
                        placeholder="Enter email address"
                      />
                      {formData.email &&
                        !TransporterFormHandler.isValidEmail(
                          formData.email
                        ) && (
                          <p className="text-xs text-red-500 mt-1">
                            Please enter a valid email address
                          </p>
                        )}
                    </div>
                  ) : (
                    transporter.email
                  )
                }
              />
              <FieldRow
                label="Phone *"
                type="text"
                value={
                  isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number (numbers only, + allowed at start)"
                    />
                  ) : (
                    formatPhoneNumber(transporter.phone)
                  )
                }
              />
            </div>
          </Section>

          <Section title="Availability">
            {availabilityLoading ? (
              <div className="text-sm text-gray-500">Loading availability...</div>
            ) : (
              <div>
                <div className="relative border border-gray-300 rounded-2xl bg-[#F0F3FC] p-2 pl-6">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("weeklyHours")}
                      className={`pb-2 px-4 transition-colors cursor-pointer relative ${
                        activeTab === "weeklyHours"
                          ? "text-black font-bold"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Weekly Hours
                      {activeTab === "weeklyHours" && (
                        <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("overrideHours")}
                      className={`pb-2 px-4 transition-colors cursor-pointer relative ${
                        activeTab === "overrideHours"
                          ? "text-black font-bold"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Override Hours
                      {activeTab === "overrideHours" && (
                        <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  {activeTab === "weeklyHours" && (
                    <WeeklyHours 
                      value={weeklyHours} 
                      onChange={isEditing ? setWeeklyHours : () => {}} 
                      disabled={!isEditing}
                    />
                  )}
                  {activeTab === "overrideHours" && (
                    <OverrideHours 
                      value={overrideHours} 
                      onChange={isEditing ? setOverrideHours : () => {}} 
                      disabled={!isEditing}
                    />
                  )}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Right Column - Service Provinces */}
        <div className="space-y-6">
          <Section title="Service Provinces">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Provinces <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3">
                    {provinceOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.serviceAreas.some(
                            (area) => area.province === option.value
                          )}
                          onChange={() => toggleProvince(option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-base">{option.label}</span>
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
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {
                              provinceOptions.find(
                                (p) => p.value === area.province
                              )?.label
                            }
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(transporter.serviceAreas || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(transporter.serviceAreas || []).map((area) => (
                      <span
                        key={area.province}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {provinceOptions.find((p) => p.value === area.province)
                          ?.label || area.province}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No provinces selected</p>
                )}
              </div>
            )}
          </Section>

          {/* Status Management - Bottom Right */}
          <Section title="Status Management">
            {isEditing ? (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TRANSPORTER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
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
                      "bg-red-100 text-red-800"
                  )}>
                  {transporter.status === "ACTIVE" && "Active"}
                  {transporter.status === "SUSPENDED" && "Suspended"}
                </span>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
