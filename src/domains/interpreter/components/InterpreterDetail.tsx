"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { cn } from "@/lib/utils";
import type { Language } from "@prisma/client";
import { InterpreterData } from "../types/InterpreterData";
import { deleteInterpreter, updateInterpreter, getLanguages } from "../actions";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import PhoneInput from "@/components/PhoneNumber";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, X, Check, ArrowLeft } from "lucide-react";
import DeleteInterpreterModal from "./DeleteInterpreterModal";
import { filterUUIDLanguages } from "@/utils/languageUtils";
import { capitalizeWords } from "@/utils/text";
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
import logger from "@/utils/logger";
import { format } from "date-fns";
import { saveInterpreterAvailabilityAction } from "../actions";
import Link from "next/link";

type Props = {
  interpreter: InterpreterData;
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

export default function InterpreterDetail({
  interpreter,
  initialAvailability,
}: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const hasAvailability = initialAvailability !== null;
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursState>(
    initialAvailability?.weeklyHours || getDefaultWeeklyHours()
  );
  const [overrideHours, setOverrideHours] = useState<OverrideHoursState>(
    initialAvailability?.overrideHours || []
  );

  // Form state
  const [formData, setFormData] = useState({
    companyName: interpreter.companyName,
    contactPerson: interpreter.contactPerson,
    email: interpreter.email,
    phone: interpreter.phone || "",
    languageIds: interpreter.languages.map((l) => l.id),
  });

  // Fetch all languages for the dropdown
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await getLanguages();
        // Filter out UUID languages
        const filteredLanguages = filterUUIDLanguages(languages);
        setAllLanguages(filteredLanguages);
      } catch (error) {
        logger.error("Failed to fetch languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteInterpreter(interpreter.id);
      toast.success("Interpreter deleted successfully!");
      router.push("/interpreter");
    } catch (error) {
      logger.error("Failed to delete interpreter:", error);
      toast.error("Failed to delete interpreter. Please try again.");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form data
    setFormData({
      companyName: interpreter.companyName,
      contactPerson: interpreter.contactPerson,
      email: interpreter.email,
      phone: interpreter.phone || "",
      languageIds: interpreter.languages.map((l) => l.id),
    });
    // Reset availability to initial state
    setWeeklyHours(initialAvailability?.weeklyHours || getDefaultWeeklyHours());
    setOverrideHours(initialAvailability?.overrideHours || []);
  };

  const handleSave = async () => {
    // Trim all fields for validation
    const trimmedCompanyName = formData.companyName.trim();
    const trimmedContactPerson = formData.contactPerson.trim();
    const trimmedEmail = formData.email.trim();

    // Validation
    if (!trimmedCompanyName) {
      toast.error("Company name is required and cannot be only spaces");
      return;
    }
    if (!trimmedContactPerson) {
      toast.error("Contact person is required and cannot be only spaces");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Email is required and cannot be only spaces");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (formData.languageIds.length === 0) {
      toast.error("At least one language is required");
      return;
    }

    setIsSaving(true);
    try {
      await updateInterpreter(interpreter.id, {
        companyName: trimmedCompanyName,
        contactPerson: trimmedContactPerson,
        email: trimmedEmail,
        phone: formData.phone.trim() || undefined,
        languageIds: formData.languageIds,
      });
      // Save availability as well
      await saveInterpreterAvailabilityAction({
        interpreterId: interpreter.id,
        weeklyHours,
        overrideHours,
      });
      toast.success("Interpreter updated successfully!");
      setIsEditMode(false);
      router.refresh();
    } catch (error) {
      logger.error("Failed to update interpreter:", error);
      toast.error("Failed to update interpreter. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageToggle = (languageId: string) => {
    setFormData((prev) => ({
      ...prev,
      languageIds: prev.languageIds.includes(languageId)
        ? prev.languageIds.filter((id) => id !== languageId)
        : [...prev.languageIds, languageId],
    }));
  };

  // Validation handlers
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow alphabets, spaces, and limit to 25 characters
    value = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 25);
    // Remove leading spaces - first character must be a letter
    value = value.replace(/^\s+/, "");
    setFormData((prev) => ({ ...prev, companyName: value }));
  };

  const handleCompanyNameBlur = () => {
    // Remove trailing spaces only when user finishes typing (on blur)
    setFormData((prev) => ({
      ...prev,
      companyName: prev.companyName.replace(/\s+$/, "").trim(),
    }));
  };

  const handleContactPersonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    // Only allow alphabets, spaces, and limit to 25 characters
    value = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 25);
    // Remove leading spaces - first character must be a letter
    value = value.replace(/^\s+/, "");
    setFormData((prev) => ({ ...prev, contactPerson: value }));
  };

  const handleContactPersonBlur = () => {
    // Remove trailing spaces only when user finishes typing (on blur)
    setFormData((prev) => ({
      ...prev,
      contactPerson: prev.contactPerson.replace(/\s+$/, "").trim(),
    }));
  };

  // Check if field contains only spaces
  const isOnlySpaces = (value: string) => {
    return value.trim().length === 0 && value.length > 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove spaces from email immediately - prevent typing spaces at all
    value = value.replace(/\s/g, "");
    setFormData((prev) => ({ ...prev, email: value }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent spacebar from being typed
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phone: e.target.value }));
  };

  // Email validation - must have at least one letter before @
  const isValidEmail = (email: string) => {
    if (!email || !email.includes("@")) return false;
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain || !domain.includes(".")) return false;
    // Must have at least one letter (a-z or A-Z) in the local part before @
    return (
      /[a-zA-Z]/.test(localPart) &&
      /^[a-zA-Z0-9._-]+$/.test(localPart) &&
      /^[^\s@]+\.[^\s@]+$/.test(domain)
    );
  };

  return (
    <DashboardShell>
      {/* Back Button and Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <Link
          href="/interpreter"
          className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
            <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
              {capitalizeWords(interpreter.companyName)}
            </span>
          </h1>
        </Link>
        <div className="flex gap-2 w-full sm:w-auto">
            {!isEditMode ? (
              <>
                <button
                  onClick={handleEdit}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full",
                    "bg-blue-50 border border-blue-200 text-blue-600",
                    "hover:bg-blue-100 transition-colors",
                    "text-sm sm:text-base",
                    "flex-1 sm:flex-initial"
                  )}>
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full",
                    "bg-red-50 border border-red-200 text-red-600",
                    "hover:bg-red-100 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "text-sm sm:text-base",
                    "flex-1 sm:flex-initial"
                  )}>
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full",
                    "bg-green-50 border border-green-200 text-green-600",
                    "hover:bg-green-100 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "text-sm sm:text-base",
                    "flex-1 sm:flex-initial"
                  )}>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm font-medium">
                    {isSaving ? "Saving..." : "Save"}
                  </span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full",
                    "bg-gray-50 border border-gray-200 text-gray-600",
                    "hover:bg-gray-100 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "text-sm sm:text-base",
                    "flex-1 sm:flex-initial"
                  )}>
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-sm font-medium">Cancel</span>
                </button>
              </>
            )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          {isEditMode ? (
            <>
              {/* Edit Mode - Two Column Layout: Company Info | Languages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-6 lg:mb-10">
                {/* Left Column - Company Information */}
                <div>
                  <Section title="Company Information">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={handleCompanyNameChange}
                          onBlur={handleCompanyNameBlur}
                          maxLength={25}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                            isOnlySpaces(formData.companyName)
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-[#00A8FF]"
                          )}
                          placeholder="Enter company name (alphabets only, max 25)"
                        />
                        {isOnlySpaces(formData.companyName) && (
                          <p className="text-xs text-red-500 mt-1">
                            Company name cannot be only spaces
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          value={formData.contactPerson}
                          onChange={handleContactPersonChange}
                          onBlur={handleContactPersonBlur}
                          maxLength={25}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                            isOnlySpaces(formData.contactPerson)
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-[#00A8FF]"
                          )}
                          placeholder="Enter contact person (alphabets only, max 25)"
                        />
                        {isOnlySpaces(formData.contactPerson) && (
                          <p className="text-xs text-red-500 mt-1">
                            Contact person cannot be only spaces
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={handleEmailChange}
                          onKeyDown={handleEmailKeyDown}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                            (formData.email && !isValidEmail(formData.email)) ||
                              isOnlySpaces(formData.email)
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-[#00A8FF]"
                          )}
                          placeholder="Enter email"
                        />
                        {formData.email && !isValidEmail(formData.email) && (
                          <p className="text-xs text-red-500 mt-1">
                            Please enter a valid email address
                          </p>
                        )}
                        {isOnlySpaces(formData.email) && (
                          <p className="text-xs text-red-500 mt-1">
                            Email cannot be only spaces
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <PhoneInput
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </Section>
                </div>

                {/* Right Column - Languages */}
                <div>
                  <Section title="Languages">
                    <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 max-h-60 overflow-y-auto">
                      <div className="flex flex-col gap-2">
                        {allLanguages.map((lang) => (
                          <label
                            key={lang.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.languageIds.includes(lang.id)}
                              onChange={() => handleLanguageToggle(lang.id)}
                              className="w-4 h-4 text-[#00A8FF] border-gray-300 rounded focus:ring-[#00A8FF]"
                            />
                            <span className="text-sm text-gray-700">
                              {lang.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </Section>
                </div>
              </div>

              {/* Availability - Full Width in Edit Mode */}
              <AvailabilityTabs
                weeklyHours={weeklyStateToArray(weeklyHours)}
                overrideHours={overrideStateToArray(overrideHours)}
                onWeeklyHoursChange={(updated) => setWeeklyHours(weeklyArrayToState(updated))}
                onOverrideHoursChange={(updated) => setOverrideHours(overrideArrayToState(updated))}
                disabled={false}
              />
            </>
          ) : (
            <>
              {/* View Mode - Two Column Layout: Company Info | Languages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-6 lg:mb-10">
                {/* Left Column - Company Information */}
                <div>
                  <Section title="Company Information">
                    <>
                      <FieldRow
                        label="Company Name"
                        value={capitalizeWords(interpreter.companyName)}
                        type="text"
                      />
                      <FieldRow
                        label="Contact Person"
                        value={capitalizeWords(interpreter.contactPerson)}
                        type="text"
                      />
                      <FieldRow
                        label="Email"
                        value={interpreter.email}
                        type="text"
                      />
                      <FieldRow
                        label="Phone"
                        value={formatPhoneNumber(interpreter.phone) || "N/A"}
                        type="text"
                      />
                    </>
                  </Section>
                </div>

                {/* Right Column - Languages */}
                <div>
                  <Section title="Languages">
                    <div className="flex flex-wrap gap-2">
                      {interpreter.languages.map((lang) => (
                        <span
                          key={lang.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white">
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </Section>
                </div>
              </div>

            </>
          )}
        </div>

        {/* Availability - Separate Card in View Mode */}
        {!isEditMode && hasAvailability && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-black font-poppins">
                Availability
              </h2>
            </div>
            <div className="p-6">
              {(() => {
                const weeklyHoursArray = weeklyStateToArray(weeklyHours);
                const overrideHoursArray = overrideStateToArray(overrideHours);
                const hasWeeklyHours = weeklyHoursArray.filter((wh) => wh.enabled).length > 0;
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
                                    const localDate = overrideDateToLocalDate(oh.date);
                                    return localDate
                                      ? format(localDate, "EEEE, MMM dd, yyyy")
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
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteInterpreterModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        interpreterName={capitalizeWords(interpreter.companyName)}
      />
    </DashboardShell>
  );
}
