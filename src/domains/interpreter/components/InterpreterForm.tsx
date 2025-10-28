"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { WEEKDAYS, AVAILABILITY_BLOCKS } from "../constants";
import { AvailabilityBlock, Language } from "@prisma/client";
import { getLanguages } from "../actions";

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
        setAllLanguages(languages);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Left side - Company Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, companyName: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
              placeholder="Enter company name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.contactPerson}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
              placeholder="Enter contact person"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
              placeholder="Enter email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Right side - Languages & Availability */}
        <div className="space-y-6">
          {/* Languages */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Languages <span className="text-red-500">*</span>
            </h2>
            <div className="rounded-lg bg-[#F6F6F6] px-4 py-3 max-h-60 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {allLanguages.map((lang) => (
                  <label
                    key={lang.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.languageIds.includes(lang.id)}
                      onChange={() => handleLanguageToggle(lang.id)}
                      className="w-4 h-4 text-[#00A8FF] border-gray-300 rounded focus:ring-[#00A8FF]"
                    />
                    <span className="text-sm text-gray-700">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {formData.languageIds.length === 0 && (
              <p className="text-xs text-red-500 mt-1">At least one language is required</p>
            )}
          </div>

          {/* Availability */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
            <div className="rounded-lg bg-[#F6F6F6] px-4 py-3">
              <div className="space-y-3">
                {WEEKDAYS.map((day) => (
                  <div key={day.value} className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">{day.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABILITY_BLOCKS.map((block) => (
                        <button
                          key={block.value}
                          type="button"
                          onClick={() => handleAvailabilityToggle(day.value, block.value)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                            isAvailabilitySelected(day.value, block.value)
                              ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
          disabled={isLoading || formData.languageIds.length === 0}
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

