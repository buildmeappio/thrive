'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardShell } from '@/layouts/dashboard';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useOrganizationForm } from '../hooks';
import type { CreateOrganizationFormProps } from '../types';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import GoogleMapsInput from '@/components/GoogleMapsInput';
import type { GoogleMapsPlaceData } from '@/types/google-maps';
import Dropdown from '@/components/Dropdown';
import { organizationSizeOptions } from '@/config/OrganizationSizeOptions';
import { timezoneOptions } from '@/components/TimezoneSelector';
import organizationActions from '../actions';
import { formatLabel } from '@/utils/labelFormat';

export default function CreateOrganizationForm({
  createOrganizationAction,
  wrapInShell = true,
}: CreateOrganizationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrgDetails, setShowOrgDetails] = useState(false);
  const [showHqAddress, setShowHqAddress] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<{ value: string; label: string }[]>(
    []
  );
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const {
    formData,
    errors,
    isCheckingName,
    handleChange,
    handleHqAddressChange,
    handleOrganizationNameBlur,
    validate,
    isFormValid,
    resetForm,
  } = useOrganizationForm();

  // Fetch organization types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await organizationActions.getOrganizationTypes();
        const typeOptions = types.map(type => ({
          value: type.name,
          label: formatLabel(type.name),
        }));
        setOrganizationTypes(typeOptions);
      } catch (error) {
        console.error('Error fetching organization types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchTypes();
  }, []);

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
        ...(formData.organizationType && { organizationType: formData.organizationType }),
        ...(formData.organizationSize && { organizationSize: formData.organizationSize }),
        ...(formData.website?.trim() && { website: formData.website.trim() }),
        ...(formData.timezone && { timezone: formData.timezone }),
        ...(formData.hqAddress &&
          formData.hqAddress.line1 &&
          formData.hqAddress.city &&
          formData.hqAddress.state &&
          formData.hqAddress.postalCode && {
            hqAddress: formData.hqAddress,
            hqAddressTimezone: formData.hqAddressTimezone,
          }),
      });

      if (result.success) {
        toast.success(ORGANIZATION_MESSAGES.SUCCESS.ORGANIZATION_CREATED);
        resetForm();
        router.push(`/organization/${result.organizationId}`);
      } else {
        toast.error(result.error || ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_ORGANIZATION);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error(ORGANIZATION_MESSAGES.ERROR.UNEXPECTED_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <>
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

          {/* Organization Details Section (Optional) */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowOrgDetails(!showOrgDetails)}
              className="mb-4 flex w-full items-center justify-between text-left"
            >
              <h2 className="font-poppins text-lg font-semibold text-black sm:text-xl">
                Organization Details (Optional)
              </h2>
              {showOrgDetails ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {showOrgDetails && (
              <div className="space-y-4">
                {/* Organization Type and Size in one row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Organization Type */}
                  <div className="flex flex-col">
                    <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                      Organization Type
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    {isLoadingTypes ? (
                      <div className="flex h-14 items-center justify-center rounded-lg bg-gray-100">
                        <span className="text-sm text-gray-500">Loading types...</span>
                      </div>
                    ) : (
                      <Dropdown
                        id="organizationType"
                        label=""
                        value={formData.organizationType || ''}
                        onChange={value =>
                          handleChange({
                            target: { name: 'organizationType', value },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        options={organizationTypes}
                        placeholder="Select organization type"
                        required
                        className="[&_select]:h-14"
                      />
                    )}
                    {errors.organizationType && (
                      <p className="mt-1 text-xs text-red-500">{errors.organizationType}</p>
                    )}
                  </div>

                  {/* Organization Size */}
                  <div className="flex flex-col">
                    <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                      Organization Size
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Dropdown
                      id="organizationSize"
                      label=""
                      value={formData.organizationSize || ''}
                      onChange={value =>
                        handleChange({
                          target: { name: 'organizationSize', value },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      options={organizationSizeOptions}
                      placeholder="Select organization size"
                      required
                      className="[&>div>select]:h-14"
                    />
                    {errors.organizationSize && (
                      <p className="mt-1 text-xs text-red-500">{errors.organizationSize}</p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex flex-col">
                  <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                    Website
                  </label>
                  <Input
                    name="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    maxLength={255}
                    className={`h-14 ${errors.website ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website}</p>}
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Providing organization details helps streamline the onboarding process for new
                  super admins.
                </div>
              </div>
            )}
          </div>

          {/* HQ Address Section (Optional) */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowHqAddress(!showHqAddress)}
              className="mb-4 flex w-full items-center justify-between text-left"
            >
              <h2 className="font-poppins text-lg font-semibold text-black sm:text-xl">
                HQ Address (Optional)
              </h2>
              {showHqAddress ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {showHqAddress && (
              <div className="space-y-4">
                {/* Address - Google Maps Input */}
                <div className="flex flex-col">
                  <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                    Address
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <GoogleMapsInput
                    value={formData.hqAddress?.line1 || ''}
                    onChange={value => {
                      // Update the address line1 when user types
                      handleHqAddressChange({
                        target: { name: 'hqAddress.line1', value },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    onPlaceSelect={(placeData: GoogleMapsPlaceData) => {
                      // Parse Google Maps address components
                      const components = placeData.components || [];

                      // Extract address components
                      const streetNumber =
                        components.find(c => c.types.includes('street_number'))?.long_name || '';
                      const route =
                        components.find(c => c.types.includes('route'))?.long_name || '';
                      const city =
                        components.find(c => c.types.includes('locality'))?.long_name || '';
                      const province =
                        components.find(c => c.types.includes('administrative_area_level_1'))
                          ?.short_name || '';
                      const postalCode =
                        components.find(c => c.types.includes('postal_code'))?.long_name || '';
                      const country =
                        components.find(c => c.types.includes('country'))?.short_name || 'CA';

                      // Combine street number and route for line1
                      const line1 = [streetNumber, route].filter(Boolean).join(' ');

                      // Update form data with parsed address
                      handleHqAddressChange({
                        target: { name: 'hqAddress.line1', value: line1 },
                      } as React.ChangeEvent<HTMLInputElement>);

                      if (city) {
                        handleHqAddressChange({
                          target: { name: 'hqAddress.city', value: city },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }

                      if (province) {
                        handleHqAddressChange({
                          target: { name: 'hqAddress.state', value: province },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }

                      if (postalCode) {
                        handleHqAddressChange({
                          target: {
                            name: 'hqAddress.postalCode',
                            value: postalCode,
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }

                      // Update latitude and longitude if available
                      if (placeData.latitude && placeData.longitude) {
                        handleHqAddressChange({
                          target: {
                            name: 'hqAddress.latitude',
                            value: placeData.latitude.toString(),
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                        handleHqAddressChange({
                          target: {
                            name: 'hqAddress.longitude',
                            value: placeData.longitude.toString(),
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }

                      // Set country if available, default to CA
                      if (country) {
                        handleHqAddressChange({
                          target: { name: 'hqAddress.country', value: country },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                    placeholder="Enter or search for address"
                    required
                    error={errors.hqAddress?.line1}
                  />
                </div>

                {/* City and State in two columns */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* City */}
                  <div className="flex flex-col">
                    <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                      City
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Input
                      name="hqAddress.city"
                      value={formData.hqAddress?.city || ''}
                      onChange={handleHqAddressChange}
                      placeholder="Enter city"
                      maxLength={100}
                      className={`h-14 ${errors.hqAddress?.city ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.hqAddress?.city && (
                      <p className="mt-1 text-xs text-red-500">{errors.hqAddress.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div className="flex flex-col">
                    <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                      State/Province
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Input
                      name="hqAddress.state"
                      value={formData.hqAddress?.state || ''}
                      onChange={handleHqAddressChange}
                      placeholder="Enter state/province"
                      maxLength={100}
                      className={`h-14 ${errors.hqAddress?.state ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.hqAddress?.state && (
                      <p className="mt-1 text-xs text-red-500">{errors.hqAddress.state}</p>
                    )}
                  </div>
                </div>

                {/* Postal Code and Timezone */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Postal Code */}
                  <div className="flex flex-col">
                    <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                      Postal Code
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Input
                      name="hqAddress.postalCode"
                      value={formData.hqAddress?.postalCode || ''}
                      onChange={handleHqAddressChange}
                      placeholder="A1A 1A1"
                      maxLength={10}
                      className={`h-14 ${errors.hqAddress?.postalCode ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.hqAddress?.postalCode && (
                      <p className="mt-1 text-xs text-red-500">{errors.hqAddress.postalCode}</p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div className="flex flex-col">
                    <label className="font-poppins mb-2 text-sm font-medium text-black sm:text-base">
                      Timezone
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Dropdown
                      id="hqAddressTimezone"
                      label=""
                      value={formData.hqAddressTimezone || ''}
                      onChange={value =>
                        handleChange({
                          target: { name: 'hqAddressTimezone', value },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      options={timezoneOptions}
                      placeholder="Select timezone"
                      required
                      className="[&>div>select]:h-14"
                    />
                    {errors.hqAddressTimezone && (
                      <p className="mt-1 text-xs text-red-500">{errors.hqAddressTimezone}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Providing HQ address helps streamline the onboarding process for new super admins.
                </div>
              </div>
            )}
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
    </>
  );
  return wrapInShell ? <DashboardShell>{content}</DashboardShell> : content;
}
