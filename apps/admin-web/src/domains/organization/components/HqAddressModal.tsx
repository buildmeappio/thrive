'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationFormData, locationInitialValues } from '../schemas/locationSchema';
import updateOrganizationHqAddress from '../actions/updateOrganizationHqAddress';
import { toast } from 'sonner';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import GoogleMapsInput from '@/components/GoogleMapsInput';
import type { GoogleMapsPlaceData } from '@/types/google-maps';
import Dropdown from '@/components/Dropdown';
import { timezoneOptions } from '@/components/TimezoneSelector';

interface HqAddressData {
  addressJson: any;
  timezone?: string;
}

export default function HqAddressModal({
  open,
  onClose,
  organizationId,
  hqAddress,
  organizationTimezone,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  hqAddress: HqAddressData | null;
  organizationTimezone?: string | null;
  onSubmit: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: locationInitialValues,
  });

  useEffect(() => {
    if (hqAddress) {
      const address =
        typeof hqAddress.addressJson === 'string'
          ? JSON.parse(hqAddress.addressJson)
          : hqAddress.addressJson;
      // Get timezone from location if available, otherwise use organization timezone
      const locationTimezone = (hqAddress as any).timezone;
      reset({
        name: 'Headquarters', // Fixed name
        address: {
          line1: address?.line1 || '',
          line2: address?.line2 || '',
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postalCode || '',
          latitude: address?.latitude,
          longitude: address?.longitude,
        },
        timezone: locationTimezone || (organizationTimezone as string) || 'America/Toronto',
        regionTag: '',
        costCenterCode: '',
        isActive: true,
      });
    } else {
      reset({
        ...locationInitialValues,
        name: 'Headquarters', // Fixed name
        timezone: organizationTimezone || 'America/Toronto', // Use org timezone if available, otherwise default
      });
    }
  }, [hqAddress, reset, open, organizationTimezone]);

  const onSubmitForm = async (data: LocationFormData) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    try {
      const result = await updateOrganizationHqAddress({
        organizationId,
        address: data.address,
      });

      console.log('Update result:', result);

      if (result.success) {
        toast.success(
          hqAddress
            ? ORGANIZATION_MESSAGES.SUCCESS.HQ_ADDRESS_UPDATED
            : ORGANIZATION_MESSAGES.SUCCESS.HQ_ADDRESS_ADDED
        );
        onSubmit();
        onClose();
      } else {
        // Type guard: check if error property exists
        const errorMessage =
          'error' in result
            ? result.error
            : ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_HQ_ADDRESS;
        console.error('Update failed:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating HQ address:', error);
      toast.error(error.message || ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_HQ_ADDRESS);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-lg sm:p-8"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-degular text-xl font-semibold sm:text-2xl">
            {hqAddress ? 'Edit HQ Address' : 'Add HQ Address'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmitForm, errors => {
            console.log('Form validation errors:', errors);
            // Show first error message
            const firstError = Object.values(errors)[0];
            if (firstError) {
              const errorMessage =
                typeof firstError === 'object' && firstError?.message
                  ? firstError.message
                  : 'Please fix the form errors before submitting';
              toast.error(errorMessage);
            }
          })}
          className="space-y-4"
        >
          {/* Address - Google Maps Input */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Address *</label>
            <GoogleMapsInput
              value={watch('address.line1') || ''}
              onChange={value => {
                setValue('address.line1', value);
                trigger('address.line1');
              }}
              onPlaceSelect={(placeData: GoogleMapsPlaceData) => {
                // Parse Google Maps address components
                const components = placeData.components || [];

                // Extract address components
                const streetNumber =
                  components.find(c => c.types.includes('street_number'))?.long_name || '';
                const route = components.find(c => c.types.includes('route'))?.long_name || '';
                const city = components.find(c => c.types.includes('locality'))?.long_name || '';
                const province =
                  components.find(c => c.types.includes('administrative_area_level_1'))
                    ?.short_name || '';
                const postalCode =
                  components.find(c => c.types.includes('postal_code'))?.long_name || '';

                // Combine street number and route for line1
                const line1 = [streetNumber, route].filter(Boolean).join(' ');

                // Update form fields with parsed address
                setValue('address.line1', line1);
                if (city) setValue('address.city', city);
                if (province) setValue('address.state', province);
                if (postalCode) setValue('address.postalCode', postalCode);
                if (placeData.latitude) setValue('address.latitude', placeData.latitude);
                if (placeData.longitude) setValue('address.longitude', placeData.longitude);

                // Trigger validation
                trigger(['address.line1', 'address.city', 'address.state', 'address.postalCode']);
              }}
              placeholder="Enter or search for address"
              required
              error={errors.address?.line1?.message}
            />
          </div>

          {/* City */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">City *</label>
            <input
              {...register('address.city')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
            {errors.address?.city && (
              <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">State/Province *</label>
            <input
              {...register('address.state')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
            {errors.address?.state && (
              <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Postal Code *</label>
            <input
              {...register('address.postalCode')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
            {errors.address?.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.address.postalCode.message}</p>
            )}
          </div>

          {/* Timezone */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Timezone *</label>
            <Dropdown
              id="timezone"
              label=""
              value={watch('timezone') || ''}
              onChange={value => {
                setValue('timezone', value);
                trigger('timezone');
              }}
              options={timezoneOptions}
              required
              placeholder="Select timezone"
            />
            {errors.timezone && (
              <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="font-poppins rounded-full border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-poppins rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : hqAddress ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
