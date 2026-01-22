"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardShell } from "@/layouts/dashboard";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useOrganizationForm } from "../hooks";
import type { CreateOrganizationFormProps } from "../types";

export default function CreateOrganizationForm({
  createOrganizationAction,
}: CreateOrganizationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formData,
    errors,
    isCheckingName,
    handleChange,
    handleOrganizationNameBlur,
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
        organizationName: formData.organizationName.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
      });

      if (result.success) {
        toast.success("Organization created and invitation sent successfully!");
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
        <Link href="/organization" className="flex-shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </Link>
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Create Organization
        </h1>
      </div>

      <div className="w-full flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 w-full"
        >
          {/* Organization Name */}
          <div className="flex flex-col mb-6">
            <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
              Organization Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              onBlur={handleOrganizationNameBlur}
              placeholder="Enter organization name"
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

          {/* Super Admin Details Section */}
          <div className="mb-6">
            <h2 className="font-poppins text-lg sm:text-xl font-semibold text-black mb-4">
              Super Admin Details
            </h2>

            {/* Two-column layout for name fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-6">
              {/* First Name */}
              <div className="flex flex-col">
                <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                  First Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  maxLength={100}
                  className={`h-14 ${errors.firstName ? "ring-2 ring-red-500" : ""}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                  Last Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  maxLength={100}
                  className={`h-14 ${errors.lastName ? "ring-2 ring-red-500" : ""}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="font-poppins text-sm sm:text-base font-medium text-black mb-2">
                Email
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                maxLength={255}
                className={`h-14 ${errors.email ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
              {isSubmitting ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
