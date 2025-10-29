"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { WEEKDAYS, AVAILABILITY_BLOCKS } from "../constants";
import { AvailabilityBlock, Language } from "@prisma/client";
import { getLanguages } from "../actions";
import { filterUUIDLanguages } from "@/utils/languageUtils";
import { Check, Globe } from "lucide-react";

type FormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  languageIds: string[];
  availability: Array<{ weekday: number; block: AvailabilityBlock }>;
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
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      languageIds: [],
      availability: [],
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

  const handleLanguageToggle = (languageId: string) => {
    setFormData((prev) => ({
      ...prev,
      languageIds: prev.languageIds.includes(languageId)
        ? prev.languageIds.filter((id) => id !== languageId)
        : [...prev.languageIds, languageId],
    }));
  };

  const handleAvailabilityToggle = (weekday: number, block: AvailabilityBlock) => {
    setFormData((prev) => {
      const exists = prev.availability.some(
        (a) => a.weekday === weekday && a.block === block
      );

      if (exists) {
        return {
          ...prev,
          availability: prev.availability.filter(
            (a) => !(a.weekday === weekday && a.block === block)
          ),
        };
      } else {
        return {
          ...prev,
          availability: [...prev.availability, { weekday, block }],
        };
      }
    });
  };

  const isAvailabilitySelected = (weekday: number, block: AvailabilityBlock) => {
    return formData.availability.some(
      (a) => a.weekday === weekday && a.block === block
    );
  };

  // Validation handlers
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow alphabets, spaces, and limit to 25 characters
    value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
    // Remove leading spaces - first character must be a letter
    value = value.replace(/^\s+/, '');
    setFormData((prev) => ({ ...prev, companyName: value }));
  };

  const handleCompanyNameBlur = () => {
    // Remove trailing spaces only when user finishes typing (on blur)
    setFormData((prev) => ({
      ...prev,
      companyName: prev.companyName.replace(/\s+$/, '').trim()
    }));
  };

  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow alphabets, spaces, and limit to 25 characters
    value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
    // Remove leading spaces - first character must be a letter
    value = value.replace(/^\s+/, '');
    setFormData((prev) => ({ ...prev, contactPerson: value }));
  };

  const handleContactPersonBlur = () => {
    // Remove trailing spaces only when user finishes typing (on blur)
    setFormData((prev) => ({
      ...prev,
      contactPerson: prev.contactPerson.replace(/\s+$/, '').trim()
    }));
  };

  // Check if field contains only spaces
  const isOnlySpaces = (value: string) => {
    return value.trim().length === 0 && value.length > 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove spaces from email immediately - prevent typing spaces at all
    value = value.replace(/\s/g, '');
    setFormData((prev) => ({ ...prev, email: value }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent spacebar from being typed
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers and + (only at the start)
    let filtered = value.replace(/[^0-9+]/g, '');
    // If + exists, ensure it's only at the start
    if (filtered.includes('+')) {
      const plusCount = (filtered.match(/\+/g) || []).length;
      // If there are multiple +, keep only the first one
      if (plusCount > 1) {
        filtered = '+' + filtered.replace(/\+/g, '');
      } else if (!filtered.startsWith('+')) {
        // Move + to the start if it's not there
        filtered = '+' + filtered.replace(/\+/g, '');
      }
    }
    setFormData((prev) => ({ ...prev, phone: filtered }));
  };

  // Email validation - must have at least one letter before @
  const isValidEmail = (email: string) => {
    if (!email || !email.includes('@')) return false;
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain || !domain.includes('.')) return false;
    // Must have at least one letter (a-z or A-Z) in the local part before @
    return /[a-zA-Z]/.test(localPart) && /^[a-zA-Z0-9._-]+$/.test(localPart) && /^[^\s@]+\.[^\s@]+$/.test(domain);
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
    if (!trimmedData.companyName || !trimmedData.contactPerson || !trimmedData.email) {
      return;
    }
    
    await onSubmit(trimmedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information Section - 2 columns */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>
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
              <p className="text-xs text-red-500 mt-1">Company name cannot be only spaces</p>
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
              <p className="text-xs text-red-500 mt-1">Contact person cannot be only spaces</p>
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
              <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent transition-all"
              placeholder="Enter phone number (e.g., +1234567890)"
            />
          </div>
        </div>
      </div>

      {/* Languages & Availability Section - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Left - Availability */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-6">
            <div className="space-y-4">
              {WEEKDAYS.map((day) => (
                <div key={day.value} className="space-y-3">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{day.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_BLOCKS.map((block) => (
                      <button
                        key={block.value}
                        type="button"
                        onClick={() => handleAvailabilityToggle(day.value, block.value)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105",
                          "border-2 shadow-sm",
                          isAvailabilitySelected(day.value, block.value)
                            ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white border-transparent shadow-lg shadow-cyan-500/30"
                            : "bg-white border-gray-300 text-gray-700 hover:border-[#00A8FF] hover:bg-cyan-50 hover:text-[#00A8FF]"
                        )}
                      >
                        {block.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Languages */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Languages <span className="text-red-500">*</span>
          </h2>
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-6 max-h-[500px] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allLanguages.map((lang) => {
                const isSelected = formData.languageIds.includes(lang.id);
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleLanguageToggle(lang.id)}
                    className={cn(
                      "relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105",
                      "border-2 shadow-sm flex items-center justify-center gap-2",
                      isSelected
                        ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white border-transparent shadow-lg shadow-cyan-500/30"
                        : "bg-white border-gray-300 text-gray-700 hover:border-[#00A8FF] hover:bg-cyan-50 hover:text-[#00A8FF]"
                    )}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 absolute top-2 right-2 bg-white/20 rounded-full p-0.5" />
                    )}
                    <Globe className={cn(
                      "w-4 h-4",
                      isSelected ? "text-white" : "text-gray-400"
                    )} />
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {formData.languageIds.length === 0 && (
            <p className="text-xs text-red-500 mt-2">At least one language is required</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full",
              "bg-gray-50 border border-gray-200 text-gray-600",
              "hover:bg-gray-100 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
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
            "flex items-center gap-2 px-6 py-2 rounded-full",
            "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

