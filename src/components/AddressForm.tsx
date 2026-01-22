'use client';

import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import GoogleMapsInput from './GoogleMapsInputRHF';
import { Dropdown } from './Dropdown';
import { provinceOptions } from '@/config/ProvinceOptions';

export interface AddressFormData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  county?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressFormProps {
  organizationHqAddress?: AddressFormData | null;
  onAddressChange?: (address: AddressFormData) => void;
  prefix?: string; // Prefix for field names (e.g., "address" for "address.line1")
}

const countryOptions = [
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
];

const AddressForm: React.FC<AddressFormProps> = ({
  organizationHqAddress,
  onAddressChange,
  prefix = 'address',
}) => {
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  const [useHqAddress, setUseHqAddress] = React.useState(false);

  const line1 = watch(`${prefix}.line1`);
  const line2 = watch(`${prefix}.line2`);
  const city = watch(`${prefix}.city`);
  const state = watch(`${prefix}.state`);
  const postalCode = watch(`${prefix}.postalCode`);
  const country = watch(`${prefix}.country`);

  // Watch for address changes and notify parent
  useEffect(() => {
    if (onAddressChange && (line1 || city || state || postalCode || country)) {
      onAddressChange({
        line1: line1 || '',
        line2: line2 || '',
        city: city || '',
        state: state || '',
        postalCode: postalCode || '',
        country: country || '',
        county: watch(`${prefix}.county`) || '',
        latitude: watch(`${prefix}.latitude`),
        longitude: watch(`${prefix}.longitude`),
      });
    }
  }, [line1, line2, city, state, postalCode, country, watch, prefix, onAddressChange]);

  // Handle "Same as HQ Address" checkbox
  const handleUseHqAddress = (checked: boolean) => {
    setUseHqAddress(checked);
    if (checked && organizationHqAddress) {
      setValue(`${prefix}.line1`, organizationHqAddress.line1 || '');
      setValue(`${prefix}.line2`, organizationHqAddress.line2 || '');
      setValue(`${prefix}.city`, organizationHqAddress.city || '');
      setValue(`${prefix}.state`, organizationHqAddress.state || '');
      setValue(`${prefix}.postalCode`, organizationHqAddress.postalCode || '');
      setValue(`${prefix}.country`, organizationHqAddress.country || 'CA');
      setValue(`${prefix}.county`, organizationHqAddress.county || '');
      if (organizationHqAddress.latitude) {
        setValue(`${prefix}.latitude`, organizationHqAddress.latitude);
      }
      if (organizationHqAddress.longitude) {
        setValue(`${prefix}.longitude`, organizationHqAddress.longitude);
      }
      // Trigger validation
      trigger([
        `${prefix}.line1`,
        `${prefix}.city`,
        `${prefix}.state`,
        `${prefix}.postalCode`,
        `${prefix}.country`,
      ]);
    }
  };

  // Handle Google Maps place selection
  const handlePlaceSelect = (placeData: any) => {
    const components = placeData.components || [];
    let streetNumber = '';
    let route = '';
    let cityName = '';
    let postalCodeValue = '';
    let province = '';
    let countryValue = 'CA';

    components.forEach((component: any) => {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        route = component.long_name;
      }
      if (types.includes('locality')) {
        cityName = component.long_name;
      }
      if (types.includes('postal_code')) {
        postalCodeValue = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        province = component.short_name;
      }
      if (types.includes('country')) {
        countryValue = component.short_name;
      }
    });

    const streetAddress = `${streetNumber} ${route}`.trim();

    if (streetAddress) {
      setValue(`${prefix}.line1`, streetAddress, { shouldValidate: true });
    }
    if (cityName) {
      setValue(`${prefix}.city`, cityName, { shouldValidate: true });
    }
    if (postalCodeValue) {
      setValue(`${prefix}.postalCode`, postalCodeValue, { shouldValidate: true });
    }
    if (province) {
      setValue(`${prefix}.state`, province, { shouldValidate: true });
    }
    if (countryValue) {
      setValue(`${prefix}.country`, countryValue, { shouldValidate: true });
    }
    if (placeData.latitude) {
      setValue(`${prefix}.latitude`, placeData.latitude);
    }
    if (placeData.longitude) {
      setValue(`${prefix}.longitude`, placeData.longitude);
    }

    trigger([
      `${prefix}.line1`,
      `${prefix}.city`,
      `${prefix}.state`,
      `${prefix}.postalCode`,
      `${prefix}.country`,
    ]);
  };

  const getError = (fieldName: string) => {
    const error = errors[prefix as keyof typeof errors];
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message as string;
    }
    const nestedError = (errors as any)?.[prefix]?.[fieldName];
    return nestedError?.message || undefined;
  };

  return (
    <div className="space-y-5">
      {/* Google Maps Autocomplete */}
      <Controller
        name={`${prefix}.autocomplete`}
        control={control}
        render={() => (
          <GoogleMapsInput
            name={`${prefix}.autocomplete`}
            label="Search Address"
            placeholder="Start typing an address..."
            setValue={setValue}
            trigger={trigger}
            onPlaceSelect={handlePlaceSelect}
            error={getError('line1')}
          />
        )}
      />

      {/* Same as HQ Address Checkbox */}
      {organizationHqAddress && (
        <div className="flex items-center space-x-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <input
            type="checkbox"
            id={`${prefix}-use-hq`}
            checked={useHqAddress}
            onChange={e => handleUseHqAddress(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#000093] focus:ring-2 focus:ring-[#000093] focus:ring-offset-0"
          />
          <Label
            htmlFor={`${prefix}-use-hq`}
            className="font-poppins cursor-pointer text-sm font-medium text-[#000000]"
          >
            Use organization HQ address
          </Label>
        </div>
      )}

      {/* Address Line 1 */}
      <div className="space-y-2">
        <Label
          htmlFor={`${prefix}-line1`}
          className="font-poppins text-sm font-medium text-[#000000]"
        >
          Address Line 1 <span className="text-red-500">*</span>
        </Label>
        <Controller
          name={`${prefix}.line1`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={`${prefix}-line1`}
              placeholder="Street address"
              disabled={useHqAddress}
              className="h-11"
            />
          )}
        />
        {getError('line1') && (
          <span className="font-poppins text-xs text-red-500">{getError('line1')}</span>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2">
        <Label
          htmlFor={`${prefix}-line2`}
          className="font-poppins text-sm font-medium text-[#000000]"
        >
          Address Line 2
          <span className="font-poppins ml-1 text-xs font-normal text-[#4D4D4D]">(Optional)</span>
        </Label>
        <Controller
          name={`${prefix}.line2`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={`${prefix}-line2`}
              placeholder="Apartment, suite, unit, etc."
              disabled={useHqAddress}
              className="h-11"
            />
          )}
        />
      </div>

      {/* City and State/Province */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor={`${prefix}-city`}
            className="font-poppins text-sm font-medium text-[#000000]"
          >
            City <span className="text-red-500">*</span>
          </Label>
          <Controller
            name={`${prefix}.city`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${prefix}-city`}
                placeholder="City"
                disabled={useHqAddress}
                className="h-11"
              />
            )}
          />
          {getError('city') && (
            <span className="font-poppins text-xs text-red-500">{getError('city')}</span>
          )}
        </div>

        <div className="space-y-2">
          <Controller
            name={`${prefix}.state`}
            control={control}
            render={({ field }) => (
              <Dropdown
                id={`${prefix}-state`}
                label="State/Province"
                value={field.value || ''}
                onChange={field.onChange}
                options={provinceOptions}
                placeholder="Select province/state"
                required
              />
            )}
          />
          {getError('state') && (
            <span className="font-poppins text-xs text-red-500">{getError('state')}</span>
          )}
        </div>
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor={`${prefix}-postalCode`}
            className="font-poppins text-sm font-medium text-[#000000]"
          >
            Postal Code <span className="text-red-500">*</span>
          </Label>
          <Controller
            name={`${prefix}.postalCode`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${prefix}-postalCode`}
                placeholder="Postal code"
                disabled={useHqAddress}
                className="h-11"
              />
            )}
          />
          {getError('postalCode') && (
            <span className="font-poppins text-xs text-red-500">{getError('postalCode')}</span>
          )}
        </div>

        <div className="space-y-2">
          <Controller
            name={`${prefix}.country`}
            control={control}
            render={({ field }) => (
              <Dropdown
                id={`${prefix}-country`}
                label="Country"
                value={field.value || 'CA'}
                onChange={field.onChange}
                options={countryOptions}
                placeholder="Select country"
                required
              />
            )}
          />
          {getError('country') && (
            <span className="font-poppins text-xs text-red-500">{getError('country')}</span>
          )}
        </div>
      </div>

      {/* County/Region (Optional) */}
      <div className="space-y-2">
        <Label
          htmlFor={`${prefix}-county`}
          className="font-poppins text-sm font-medium text-[#000000]"
        >
          County/Region
          <span className="font-poppins ml-1 text-xs font-normal text-[#4D4D4D]">(Optional)</span>
        </Label>
        <Controller
          name={`${prefix}.county`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={`${prefix}-county`}
              placeholder="County or region"
              disabled={useHqAddress}
              className="h-11"
            />
          )}
        />
      </div>
    </div>
  );
};

export default AddressForm;
