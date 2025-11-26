"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Language } from "@prisma/client";
import { getLanguages } from "../actions";
import { filterUUIDLanguages } from "@/utils/languageUtils";
import { Check, ChevronDown } from "lucide-react";
import PhoneInput from "@/components/PhoneNumber";
import {
  AvailabilityTabs,
  WeeklyHoursState,
  OverrideHoursState,
  weeklyStateToArray,
  weeklyArrayToState,
  overrideStateToArray,
  overrideArrayToState,
} from "@/components/availability";

type FormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  languageIds: string[];
  weeklyHours: WeeklyHoursState;
  overrideHours: OverrideHoursState;
};

type Props = {
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
};

export default function InterpreterForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isLoading = false,
}: Props) {
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      languageIds: [],
      weeklyHours: {
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
      },
      overrideHours: [],
    }
  );

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await getLanguages();
        // Filter out UUID languages
        const filteredLanguages = filterUUIDLanguages(languages);
        setAllLanguages(filteredLanguages);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownOpen) {
        const target = event.target as Element;
        const isInsideDropdown = target.closest(".language-dropdown");
        if (!isInsideDropdown) {
          setLanguageDropdownOpen(false);
        }
      }
    };

    if (languageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [languageDropdownOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!isValidEmail(formData.email)) {
      return;
    }

    // Trim all fields before submission
    const trimmedData = {
      ...formData,
      companyName: formData.companyName.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    // Check if required fields are not empty after trimming
    if (
      !trimmedData.companyName ||
      !trimmedData.contactPerson ||
      !trimmedData.email
    ) {
      return;
    }

    await onSubmit(trimmedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information Section - 2 columns */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Company Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={handleCompanyNameChange}
              onBlur={handleCompanyNameBlur}
              maxLength={25}
              className={cn(
                "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all",
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
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.contactPerson}
              onChange={handleContactPersonChange}
              onBlur={handleContactPersonBlur}
              maxLength={25}
              className={cn(
                "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all",
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
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={handleEmailChange}
              onKeyDown={handleEmailKeyDown}
              className={cn(
                "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                formData.email && !isValidEmail(formData.email)
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
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <PhoneInput
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Languages Section */}
      <div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Languages <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Languages <span className="text-red-500">*</span>
              </label>
              <div className="relative language-dropdown">
                <button
                  type="button"
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl text-left focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                    formData.languageIds.length === 0
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#00A8FF]"
                  )}>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        formData.languageIds.length === 0
                          ? "text-gray-400"
                          : "text-gray-700"
                      )}>
                      {formData.languageIds.length === 0
                        ? "Select languages..."
                        : formData.languageIds.length === 1
                        ? allLanguages.find(
                            (l) => l.id === formData.languageIds[0]
                          )?.name || "1 language selected"
                        : `${formData.languageIds.length} languages selected`}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-gray-400 transition-transform",
                        languageDropdownOpen && "rotate-180"
                      )}
                    />
                  </div>
                </button>
                {languageDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    <div className="py-2">
                      {allLanguages.map((language) => {
                        const isSelected = formData.languageIds.includes(
                          language.id
                        );
                        return (
                          <button
                            key={language.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLanguageToggle(language.id);
                            }}
                            className={cn(
                              "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2",
                              isSelected ? "bg-gray-50" : ""
                            )}>
                            <div
                              className={cn(
                                "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                                isSelected
                                  ? "border-[#00A8FF] bg-[#00A8FF]"
                                  : "border-gray-300"
                              )}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span
                              className={
                                isSelected
                                  ? "text-[#00A8FF] font-medium"
                                  : "text-gray-700"
                              }>
                              {language.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {formData.languageIds.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  At least one language is required
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <AvailabilityTabs
        weeklyHours={weeklyStateToArray(formData.weeklyHours)}
        overrideHours={overrideStateToArray(formData.overrideHours)}
        onWeeklyHoursChange={(weeklyHours) =>
          setFormData((prev) => ({ ...prev, weeklyHours: weeklyArrayToState(weeklyHours) }))
        }
        onOverrideHoursChange={(overrideHours) =>
          setFormData((prev) => ({ ...prev, overrideHours: overrideArrayToState(overrideHours) }))
        }
        disabled={isLoading}
      />

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-1.5 sm:px-6 sm:py-2 rounded-full",
              "bg-gray-50 border border-gray-200 text-gray-600",
              "hover:bg-gray-100 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "text-sm sm:text-base",
              "w-full sm:w-auto"
            )}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={
            isLoading ||
            formData.languageIds.length === 0 ||
            !formData.companyName.trim() ||
            !formData.contactPerson.trim() ||
            !formData.email.trim() ||
            !isValidEmail(formData.email) ||
            isOnlySpaces(formData.companyName) ||
            isOnlySpaces(formData.contactPerson) ||
            isOnlySpaces(formData.email)
          }
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-1.5 sm:px-6 sm:py-2 rounded-full",
            "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "text-sm sm:text-base",
            "w-full sm:w-auto"
          )}>
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
