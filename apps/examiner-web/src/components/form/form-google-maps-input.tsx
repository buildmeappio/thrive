'use client';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import GoogleMapsInput from '@/components/GoogleMapsInput';
import { GoogleMapsPlaceData } from '@/types/google-maps';

interface FormGoogleMapsInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onPlaceSelect?: (placeData: GoogleMapsPlaceData) => void;
  from?: string;
  province?: string; // Filter addresses by province
}

/**
 * FormGoogleMapsInput - React Hook Form wrapper for GoogleMapsInput
 *
 * Integrates Google Maps Places Autocomplete with React Hook Form
 * Automatically handles validation and error display
 */
const FormGoogleMapsInput: React.FC<FormGoogleMapsInputProps> = ({
  name,
  label = 'Address',
  placeholder = '150 John Street, Toronto',
  required = false,
  className = '',
  onPlaceSelect,
  from = '',
  province,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <GoogleMapsInput
          {...field}
          label={label}
          placeholder={placeholder}
          required={required}
          className={className}
          error={error}
          onPlaceSelect={placeData => {
            // Update the field value
            field.onChange(placeData.formattedAddress);

            // Call the custom handler if provided
            if (onPlaceSelect) {
              onPlaceSelect(placeData);
            }
          }}
          from={from}
          province={province}
        />
      )}
    />
  );
};

export default FormGoogleMapsInput;
