"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTransporter } from "../server";
import { toast } from "sonner";
import { provinceOptions } from "@/constants/options";
import { cn } from "@/lib/utils";
import { TransporterFormHandler } from "../server";

export default function CreateTransporterPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    serviceAreas: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const result = await createTransporter(validation.sanitizedData!);

      if (result.success) {
        toast.success("Transporter created successfully");
        router.push("/transporter");
      } else {
        toast.error(result.error || "Failed to create transporter");
      }
    } catch (error) {
      toast.error("An error occurred while creating transporter", error);
    } finally {
      setIsLoading(false);
    }
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

  // Input handlers using the form handler service
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
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Transporter
            </h1>
            <p className="text-gray-600">
              Add a new medical transportation service provider
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg p-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <Section title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.companyName}
                  onChange={handleCompanyNameChange}
                  onBlur={handleCompanyNameBlur}
                  maxLength={25}
                  className={cn(
                    TransporterFormHandler.isOnlySpaces(formData.companyName)
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter company name (alphabets only, max 25)"
                  required
                />
                {TransporterFormHandler.isOnlySpaces(formData.companyName) && (
                  <p className="text-xs text-red-500 mt-1">
                    Company name cannot be only spaces
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.contactPerson}
                  onChange={handleContactPersonChange}
                  onBlur={handleContactPersonBlur}
                  maxLength={25}
                  className={cn(
                    TransporterFormHandler.isOnlySpaces(formData.contactPerson)
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter contact person name (alphabets only, max 25)"
                  required
                />
                {TransporterFormHandler.isOnlySpaces(
                  formData.contactPerson
                ) && (
                  <p className="text-xs text-red-500 mt-1">
                    Contact person cannot be only spaces
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  className={cn(
                    formData.email &&
                      !TransporterFormHandler.isValidEmail(formData.email)
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter email address"
                  required
                />
                {formData.email &&
                  !TransporterFormHandler.isValidEmail(formData.email) && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter a valid email address
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={cn(
                    formData.phone &&
                      !TransporterFormHandler.isValidPhone(formData.phone)
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter phone number (numbers only, + allowed at start)"
                  required
                />
                {formData.phone &&
                  !TransporterFormHandler.isValidPhone(formData.phone) && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter a valid phone number
                    </p>
                  )}
              </div>
            </div>
          </Section>
        </div>

        {/* Right Column - Service Provinces */}
        <div className="space-y-6">
          <Section title="Service Provinces">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Provinces <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
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
                      <span className="text-sm">{option.label}</span>
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
          </Section>
        </div>

        {/* Actions */}
        <div className="col-span-full flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80">
            {isLoading ? "Creating..." : "Create Transporter"}
          </Button>
        </div>
      </div>
    </div>
  );
}
