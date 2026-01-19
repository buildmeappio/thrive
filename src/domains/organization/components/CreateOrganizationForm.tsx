"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardShell } from "@/layouts/dashboard";
import { ArrowLeft, MapPin, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import GoogleMapsInput from "@/components/GoogleMapsInput";
import { provinceOptions } from "@/constants/options";
import Link from "next/link";
import { useOrganizationForm } from "../hooks";
import { formatText } from "@/utils/text";
import type { CreateOrganizationFormProps } from "../types";

export default function CreateOrganizationForm({
  organizationTypes,
  createOrganizationAction,
}: CreateOrganizationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formData,
    errors,
    isCheckingName,
    handleChange,
    handleAddressLookupChange,
    handlePlaceSelect,
    validate,
    isFormValid,
    resetForm,
  } = useOrganizationForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isValid = await validate();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      const result = await createOrganizationAction({
        organizationTypeName: formData.organizationType,
        organizationName: formData.organizationName,
        addressLookup: formData.addressLookup,
        streetAddress: formData.streetAddress,
        aptUnitSuite: formData.aptUnitSuite || undefined,
        city: formData.city,
        postalCode: formData.postalCode,
        province: formData.province,
        organizationWebsite: formData.organizationWebsite || undefined,
      });

      if (result.success) {
        toast.success("Organization created successfully!");
        resetForm();
        router.push(`/organization/${result.organizationId}`);
      } else {
        toast.error(result.error || "Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      {/* Back Button and Heading */}
      <div className="mb-6 flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <Link
          href="/organization"
          className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
            Create Organization
          </h1>
        </Link>
      </div>

      <div className="w-full flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6  w-full"
        >
          {/* Two-column layout for first row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-6">
            {/* Organization Type */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Organization Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative mt-2">
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  className={`flex h-14 w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-4 pr-12 text-sm font-normal appearance-none cursor-pointer transition-colors ${
                    !formData.organizationType
                      ? "text-[#9EA9AA]"
                      : "text-[#333]"
                  } ${
                    errors.organizationType
                      ? "ring-2 ring-red-500"
                      : "focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
                  } focus-visible:ring-offset-0 focus-visible:outline-none hover:bg-[#E8ECED]`}
                >
                  <option value="" disabled className="text-[#9EA9AA]">
                    Select Organization Type
                  </option>
                  {organizationTypes.map((type) => (
                    <option key={type} value={type} className="text-[#333]">
                      {formatText(type)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-5 h-5 text-[#A4A4A4]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {errors.organizationType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.organizationType}
                </p>
              )}
            </div>

            {/* Organization Name */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Organization Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Enter your organization name"
                maxLength={100}
                className={`h-14 ${errors.organizationName ? "ring-2 ring-red-500" : ""}`}
                disabled={isCheckingName}
              />
              {errors.organizationName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.organizationName}
                </p>
              )}
              {isCheckingName && (
                <p className="text-xs text-gray-400 mt-1">
                  Checking availability...
                </p>
              )}
            </div>
          </div>

          {/* Address Lookup - Full Width */}
          <div className="flex flex-col mb-6">
            <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
              Address Lookup
              <span className="text-red-500 ml-1">*</span>
            </label>
            <GoogleMapsInput
              name="addressLookup"
              value={formData.addressLookup}
              onChange={handleAddressLookupChange}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Enter your address"
              error={errors.addressLookup}
              maxLength={500}
            />
          </div>

          {/* Three-column layout for address fields */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6 ">
            {/* Street Address */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Street Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                placeholder="Enter your street address"
                maxLength={200}
                className={`h-14 ${errors.streetAddress ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.streetAddress && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.streetAddress}
                </p>
              )}
            </div>

            {/* Apt / Unit / Suite */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Apt / Unit / Suite
              </label>
              <Input
                name="aptUnitSuite"
                value={formData.aptUnitSuite}
                onChange={handleChange}
                placeholder="Your apt/unit/suite"
                maxLength={50}
                className={`h-14 ${errors.aptUnitSuite ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.aptUnitSuite && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.aptUnitSuite}
                </p>
              )}
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                City
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Your city"
                maxLength={100}
                className={`h-14 ${errors.city ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Three-column layout for postal code, province, website */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6 ">
            {/* Postal Code */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Postal Code
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter your postal code"
                className={`h-14 ${errors.postalCode ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>

            {/* Province / State */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Province / State
              </label>
              <div className="relative mt-2">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A4A4A4] pointer-events-none z-10" />
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`flex h-14 w-full items-center rounded-[10px] border-none bg-[#F2F5F6] pl-12 pr-12 text-sm font-normal appearance-none cursor-pointer transition-colors ${
                    !formData.province ? "text-[#9EA9AA]" : "text-[#333]"
                  } focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none hover:bg-[#E8ECED]`}
                >
                  <option value="" disabled className="text-[#9EA9AA]">
                    Select Province
                  </option>
                  {provinceOptions.map((province) => (
                    <option
                      key={province.value}
                      value={province.value}
                      className="text-[#333]"
                    >
                      {province.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-5 h-5 text-[#A4A4A4]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Organization Website */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Organization Website
              </label>
              <Input
                icon={Globe}
                name="organizationWebsite"
                value={formData.organizationWebsite}
                onChange={handleChange}
                placeholder="Enter your organization website"
                maxLength={255}
                className={`h-14 ${errors.organizationWebsite ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.organizationWebsite && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.organizationWebsite}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={!isFormValid() || isCheckingName || isSubmitting}
              className={`flex items-center gap-2 px-10 py-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white rounded-full transition-opacity font-poppins text-sm sm:text-base font-medium ${
                !isFormValid() || isCheckingName || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90 cursor-pointer"
              }`}
            >
              {isSubmitting ? "Creating..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
