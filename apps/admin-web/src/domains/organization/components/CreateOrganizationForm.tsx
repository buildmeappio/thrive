'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardShell } from '@/layouts/dashboard';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useOrganizationForm } from '../hooks';
import type { CreateOrganizationFormProps } from '../types';

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
        toast.success('Organization created and invitation sent successfully!');
        resetForm();
        router.push(`/organization/${result.organizationId}`);
      } else {
        toast.error(result.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      {/* Back Button and Heading */}
      <div className="mb-6 flex flex-shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/organization" className="flex-shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
            <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
          </div>
        </Link>
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Create Organization
        </h1>
      </div>

      <div className="flex w-full flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 lg:px-12"
        >
          {/* Organization Name */}
          <div className="mb-6 flex flex-col">
            <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
              Organization Name
              <span className="ml-1 text-red-500">*</span>
            </label>
            <Input
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              onBlur={handleOrganizationNameBlur}
              placeholder="Enter organization name"
              maxLength={100}
              className={`h-14 ${errors.organizationName ? 'ring-2 ring-red-500' : ''}`}
              disabled={isCheckingName}
            />
            {errors.organizationName && (
              <p className="mt-1 text-xs text-red-500">{errors.organizationName}</p>
            )}
            {isCheckingName && (
              <p className="mt-1 text-xs text-gray-400">Checking availability...</p>
            )}
          </div>

          {/* Super Admin Details Section */}
          <div className="mb-6">
            <h2 className="font-poppins mb-4 text-lg font-semibold text-black sm:text-xl">
              Super Admin Details
            </h2>

            {/* Two-column layout for name fields */}
            <div className="mb-6 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
              {/* First Name */}
              <div className="flex flex-col">
                <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                  First Name
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  maxLength={100}
                  className={`h-14 ${errors.firstName ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                  Last Name
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  maxLength={100}
                  className={`h-14 ${errors.lastName ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                Email
                <span className="ml-1 text-red-500">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                maxLength={255}
                className={`h-14 ${errors.email ? 'ring-2 ring-red-500' : ''}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid() || isCheckingName || isSubmitting}
              className={`font-poppins flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-10 py-2 text-sm font-medium text-white transition-opacity sm:text-base ${
                !isFormValid() || isCheckingName || isSubmitting
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
