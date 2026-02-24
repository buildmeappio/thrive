'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import AddressForm, { type AddressFormData } from '@/components/AddressForm';
import TimezoneSelector from '@/components/TimezoneSelector';
import {
  locationSchema,
  locationInitialValues,
  type LocationFormData,
} from '../schemas/locationSchema';
import { getOrganizationHqAddress } from '@/domains/organization/actions';
import { createLocation, updateLocation } from '../actions';
import { toast } from 'sonner';
import { URLS } from '@/constants/routes';

interface LocationFormProps {
  locationId?: string;
  initialData?: Partial<LocationFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  locationId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hqAddress, setHqAddress] = useState<AddressFormData | null>(null);
  const router = useRouter();

  const methods = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: initialData || locationInitialValues,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = methods;

  // Load HQ address on mount
  useEffect(() => {
    const loadHqAddress = async () => {
      try {
        const address = await getOrganizationHqAddress();
        setHqAddress(address);
      } catch (error) {
        console.error('Failed to load HQ address:', error);
      }
    };

    loadHqAddress();
  }, []);

  // Transform address form data to JSON format
  const transformAddressToJson = (address: AddressFormData) => {
    return {
      line1: address.line1,
      ...(address.line2 && { line2: address.line2 }),
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      ...(address.county && { county: address.county }),
      ...(address.latitude && { latitude: address.latitude }),
      ...(address.longitude && { longitude: address.longitude }),
    };
  };

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      const addressJson = transformAddressToJson(data.address);

      if (locationId) {
        // Update existing location
        const result = await updateLocation({
          locationId,
          name: data.name,
          addressJson,
          timezone: data.timezone,
          regionTag: data.regionTag || undefined,
          costCenterCode: data.costCenterCode || undefined,
          isActive: data.isActive,
        });

        if (result.success) {
          toast.success('Location updated successfully');
          onSuccess?.();
          // Small delay to ensure toast is visible before navigation
          setTimeout(() => {
            router.push(URLS.LOCATIONS);
          }, 100);
        } else {
          toast.error(result.error || 'Failed to update location');
        }
      } else {
        // Create new location
        const result = await createLocation({
          name: data.name,
          addressJson,
          timezone: data.timezone,
          regionTag: data.regionTag || undefined,
          costCenterCode: data.costCenterCode || undefined,
          isActive: data.isActive,
        });

        if (result.success) {
          toast.success('Location created successfully');
          onSuccess?.();
          // Small delay to ensure toast is visible before navigation
          setTimeout(() => {
            router.push(URLS.LOCATIONS);
          }, 100);
        } else {
          toast.error(result.error || 'Failed to create location');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Essential Fields */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information Section */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-poppins text-lg font-semibold text-[#000000]">
                  Basic Information
                </h2>
                <p className="font-poppins mt-1 text-sm text-[#4D4D4D]">
                  Essential details for identifying and managing this location
                </p>
              </div>

              <div className="space-y-5">
                {/* Location Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-poppins text-sm font-medium text-[#000000]">
                    Location Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('name')}
                    id="name"
                    placeholder="e.g., Main Office, Downtown Branch"
                    disabled={isSubmitting}
                    className="h-11"
                  />
                  {errors.name && (
                    <span className="font-poppins text-xs text-red-500">{errors.name.message}</span>
                  )}
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <TimezoneSelector name="timezone" required />
                  {errors.timezone && (
                    <span className="font-poppins text-xs text-red-500">
                      {errors.timezone.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-poppins text-lg font-semibold text-[#000000]">Address</h2>
                <p className="font-poppins mt-1 text-sm text-[#4D4D4D]">
                  Physical location address used for adjustor assignments and case management
                </p>
              </div>

              <div className="space-y-5">
                <AddressForm
                  organizationHqAddress={hqAddress}
                  prefix="address"
                  onAddressChange={address => {
                    setValue('address', address);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Additional Options */}
          <div className="space-y-6 lg:col-span-1">
            {/* Additional Details Section */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-poppins text-lg font-semibold text-[#000000]">
                  Additional Details
                </h2>
                <p className="font-poppins mt-1 text-sm text-[#4D4D4D]">
                  Optional information for organization and reporting
                </p>
              </div>

              <div className="space-y-5">
                {/* Region Tag */}
                <div className="space-y-2">
                  <Label
                    htmlFor="regionTag"
                    className="font-poppins text-sm font-medium text-[#000000]"
                  >
                    Region Tag
                    <span className="font-poppins ml-1 text-xs font-normal text-[#4D4D4D]">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    {...register('regionTag')}
                    id="regionTag"
                    placeholder="e.g., GTA, West Coast"
                    disabled={isSubmitting}
                    className="h-11"
                  />
                  {errors.regionTag && (
                    <span className="font-poppins text-xs text-red-500">
                      {errors.regionTag.message}
                    </span>
                  )}
                </div>

                {/* Cost Center Code */}
                <div className="space-y-2">
                  <Label
                    htmlFor="costCenterCode"
                    className="font-poppins text-sm font-medium text-[#000000]"
                  >
                    Cost Center Code
                    <span className="font-poppins ml-1 text-xs font-normal text-[#4D4D4D]">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    {...register('costCenterCode')}
                    id="costCenterCode"
                    placeholder="e.g., CC-001"
                    disabled={isSubmitting}
                    className="h-11"
                  />
                  {errors.costCenterCode && (
                    <span className="font-poppins text-xs text-red-500">
                      {errors.costCenterCode.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-poppins text-lg font-semibold text-[#000000]">Status</h2>
                <p className="font-poppins mt-1 text-sm text-[#4D4D4D]">
                  Control location availability for assignments
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#000093] focus:ring-2 focus:ring-[#000093] focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="isActive"
                      className="font-poppins cursor-pointer text-sm font-medium text-[#000000]"
                    >
                      Active Location
                    </Label>
                    <p className="font-poppins mt-1 text-xs text-[#4D4D4D]">
                      Inactive locations won&apos;t appear in adjustor assignment options
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="sticky bottom-0 z-10 mt-10 border-t border-gray-200 pb-4 pt-6 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                onCancel?.();
                router.push(URLS.LOCATIONS);
              }}
              disabled={isSubmitting}
              className="font-poppins rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-[#4D4D4D] transition-all hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-poppins rounded-full bg-[#000093] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#000080] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {locationId ? 'Updating Location...' : 'Creating Location...'}
                </span>
              ) : locationId ? (
                'Update Location'
              ) : (
                'Create Location'
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default LocationForm;
