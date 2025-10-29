"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { cn } from "@/lib/utils";
import { InterpreterData } from "../types/InterpreterData";
import { deleteInterpreter, updateInterpreter, getLanguages } from "../actions";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phone";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, X, Check } from "lucide-react";
import { getWeekdayLabel, getBlockLabel, WEEKDAYS, AVAILABILITY_BLOCKS } from "../constants";
import { AvailabilityBlock, Language } from "@prisma/client";
import DeleteInterpreterModal from "./DeleteInterpreterModal";
import { filterUUIDLanguages } from "@/utils/languageUtils";
import { capitalizeWords } from "@/utils/text";

type Props = { interpreter: InterpreterData };

export default function InterpreterDetail({ interpreter }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: interpreter.companyName,
    contactPerson: interpreter.contactPerson,
    email: interpreter.email,
    phone: interpreter.phone || "",
    languageIds: interpreter.languages.map(l => l.id),
    availability: interpreter.availability.map(a => ({
      weekday: a.weekday,
      block: a.block
    }))
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
        console.error("Failed to fetch languages:", error);
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
      console.error("Failed to delete interpreter:", error);
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
      languageIds: interpreter.languages.map(l => l.id),
      availability: interpreter.availability.map(a => ({
        weekday: a.weekday,
        block: a.block
      }))
    });
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
        availability: formData.availability
      });
      toast.success("Interpreter updated successfully!");
      setIsEditMode(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update interpreter:", error);
      toast.error("Failed to update interpreter. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageToggle = (languageId: string) => {
    setFormData(prev => ({
      ...prev,
      languageIds: prev.languageIds.includes(languageId)
        ? prev.languageIds.filter(id => id !== languageId)
        : [...prev.languageIds, languageId]
    }));
  };

  const handleAvailabilityToggle = (weekday: number, block: AvailabilityBlock) => {
    setFormData(prev => {
      const exists = prev.availability.some(
        a => a.weekday === weekday && a.block === block
      );
      
      if (exists) {
        return {
          ...prev,
          availability: prev.availability.filter(
            a => !(a.weekday === weekday && a.block === block)
          )
        };
      } else {
        return {
          ...prev,
          availability: [...prev.availability, { weekday, block }]
        };
      }
    });
  };

  const isAvailabilitySelected = (weekday: number, block: AvailabilityBlock) => {
    return formData.availability.some(
      a => a.weekday === weekday && a.block === block
    );
  };

  // Validation handlers
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow alphabets, spaces, and limit to 25 characters
    value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
    // Remove leading spaces - first character must be a letter
    value = value.replace(/^\s+/, '');
    setFormData(prev => ({ ...prev, companyName: value }));
  };

  const handleCompanyNameBlur = () => {
    // Remove trailing spaces only when user finishes typing (on blur)
    setFormData(prev => ({
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
    setFormData(prev => ({ ...prev, contactPerson: value }));
  };

  const handleContactPersonBlur = () => {
    // Remove trailing spaces only when user finishes typing (on blur)
    setFormData(prev => ({
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
    setFormData(prev => ({ ...prev, email: value }));
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
    setFormData(prev => ({ ...prev, phone: filtered }));
  };

  // Email validation - must have at least one letter before @
  const isValidEmail = (email: string) => {
    if (!email || !email.includes('@')) return false;
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain || !domain.includes('.')) return false;
    // Must have at least one letter (a-z or A-Z) in the local part before @
    return /[a-zA-Z]/.test(localPart) && /^[a-zA-Z0-9._-]+$/.test(localPart) && /^[^\s@]+\.[^\s@]+$/.test(domain);
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
            {capitalizeWords(interpreter.companyName)}
          </span>
        </h1>
        <div className="flex gap-2">
          {!isEditMode ? (
            <>
              <button
                onClick={handleEdit}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-blue-50 border border-blue-200 text-blue-600",
                  "hover:bg-blue-100 transition-colors"
                )}
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-red-50 border border-red-200 text-red-600",
                  "hover:bg-red-100 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-green-50 border border-green-200 text-green-600",
                  "hover:bg-green-100 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-gray-50 border border-gray-200 text-gray-600",
                  "hover:bg-gray-100 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Left side - Company Information & Languages */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Company Information */}
              <Section title="Company Information">
                {!isEditMode ? (
                  <>
                    <FieldRow label="Company Name" value={capitalizeWords(interpreter.companyName)} type="text" />
                    <FieldRow label="Contact Person" value={capitalizeWords(interpreter.contactPerson)} type="text" />
                    <FieldRow label="Email" value={interpreter.email} type="text" />
                    <FieldRow label="Phone" value={formatPhoneNumber(interpreter.phone) || "N/A"} type="text" />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Company Name *</label>
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
                        <p className="text-xs text-red-500 mt-1">Company name cannot be only spaces</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Contact Person *</label>
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
                        <p className="text-xs text-red-500 mt-1">Contact person cannot be only spaces</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        onKeyDown={handleEmailKeyDown}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                          (formData.email && !isValidEmail(formData.email)) || isOnlySpaces(formData.email)
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#00A8FF]"
                        )}
                        placeholder="Enter email"
                      />
                      {formData.email && !isValidEmail(formData.email) && (
                        <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                      )}
                      {isOnlySpaces(formData.email) && (
                        <p className="text-xs text-red-500 mt-1">Email cannot be only spaces</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
                        placeholder="Enter phone number (e.g., +1234567890)"
                      />
                    </div>
                  </div>
                )}
              </Section>

              {/* Languages */}
              <Section title="Languages">
                {!isEditMode ? (
                  <div className="flex flex-wrap gap-2">
                    {interpreter.languages.map((lang) => (
                      <span
                        key={lang.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white"
                      >
                        {lang.name}
                      </span>
                    ))}
                  </div>
                ) : (
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
                )}
              </Section>
            </div>

            {/* Right side - Availability */}
            <Section title="Availability">
                {!isEditMode ? (
                  <div className="rounded-lg bg-[#F6F6F6] px-4 py-3">
                    {interpreter.availability.length > 0 ? (
                      <div className="space-y-3">
                        {(() => {
                          const grouped = interpreter.availability.reduce((acc, avail) => {
                            const day = getWeekdayLabel(avail.weekday);
                            if (!acc[day]) {
                              acc[day] = [];
                            }
                            acc[day].push(getBlockLabel(avail.block));
                            return acc;
                          }, {} as Record<string, string[]>);

                          return Object.entries(grouped).map(([day, blocks]) => (
                            <div key={day} className="flex items-start gap-3">
                              <span className="text-sm font-semibold font-poppins text-[#000080] min-w-[100px]">
                                {day}:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {blocks.map((block, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium font-poppins bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]"
                                  >
                                    {block}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <p className="font-poppins text-sm text-[#4E4E4E]">
                        No availability set
                      </p>
                    )}
                  </div>
                ) : (
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
                )}
              </Section>
          </div>
        </div>
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

