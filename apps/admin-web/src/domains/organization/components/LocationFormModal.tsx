'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationFormData, locationInitialValues } from '../schemas/locationSchema';
import locationActions from '../actions/locationActions';
import { toast } from 'sonner';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import GoogleMapsInput from '@/components/GoogleMapsInput';
import type { GoogleMapsPlaceData } from '@/types/google-maps';
import Dropdown from '@/components/Dropdown';
import { timezoneOptions } from '@/components/TimezoneSelector';

type Location = {
  id: string;
  name: string;
  addressJson: any;
  timezone: string | null;
  regionTag: string | null;
  costCenterCode: string | null;
  isActive: boolean;
};

export default function LocationFormModal({
  open,
  onClose,
  organizationId,
  location,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  location: Location | null;
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
    if (location) {
      const address =
        typeof location.addressJson === 'string'
          ? JSON.parse(location.addressJson)
          : location.addressJson;
      reset({
        name: location.name,
        address: {
          line1: address?.line1 || '',
          line2: address?.line2 || '',
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postalCode || '',
          latitude: address?.latitude,
          longitude: address?.longitude,
        },
        timezone: location.timezone || '',
        regionTag: location.regionTag || '',
        costCenterCode: location.costCenterCode || '',
        isActive: location.isActive,
      });
    } else {
      reset(locationInitialValues);
    }
  }, [location, reset, open]);

  const onSubmitForm = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      const result = location
        ? await locationActions.updateLocation({
            locationId: location.id,
            organizationId,
            ...data,
          })
        : await locationActions.createLocation({
            organizationId,
            ...data,
          });

      if (result.success) {
        toast.success(
          location
            ? ORGANIZATION_MESSAGES.SUCCESS.LOCATION_UPDATED
            : ORGANIZATION_MESSAGES.SUCCESS.LOCATION_CREATED
        );
        onSubmit();
      } else {
        toast.error(
          location
            ? ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_LOCATION
            : ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_LOCATION
        );
      }
    } catch {
      toast.error(
        location
          ? ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_LOCATION
          : ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_LOCATION
      );
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
            {location ? 'Edit Location' : 'Create Location'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Location Name *</label>
            <input
              {...register('name')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Address *</label>
            <GoogleMapsInput
              value={watch('address.line1') || ''}
              onChange={value => {
                setValue('address.line1', value);
                trigger('address.line1');
              }}
              onPlaceSelect={(placeData: GoogleMapsPlaceData) => {
                const components = placeData.components || [];
                const streetNumber =
                  components.find(c => c.types.includes('street_number'))?.long_name || '';
                const route = components.find(c => c.types.includes('route'))?.long_name || '';
                const city = components.find(c => c.types.includes('locality'))?.long_name || '';
                const province =
                  components.find(c => c.types.includes('administrative_area_level_1'))
                    ?.short_name || '';
                const postalCode =
                  components.find(c => c.types.includes('postal_code'))?.long_name || '';

                const line1 = [streetNumber, route].filter(Boolean).join(' ');
                setValue('address.line1', line1);
                if (city) setValue('address.city', city);
                if (province) setValue('address.state', province);
                if (postalCode) setValue('address.postalCode', postalCode);
                if (placeData.latitude) setValue('address.latitude', placeData.latitude);
                if (placeData.longitude) setValue('address.longitude', placeData.longitude);
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
            <Dropdown
              id="timezone"
              label="Timezone"
              value={watch('timezone') || ''}
              onChange={value => {
                setValue('timezone', value);
                trigger('timezone');
              }}
              options={timezoneOptions}
              placeholder="Select timezone"
              required
            />
            {errors.timezone && (
              <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
            )}
          </div>

          {/* Region Tag */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Region Tag</label>
            <input
              {...register('regionTag')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
          </div>

          {/* Cost Center Code */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Cost Center Code</label>
            <input
              {...register('costCenterCode')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label className="font-poppins text-sm">Active</label>
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
              {isSubmitting ? 'Saving...' : location ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
