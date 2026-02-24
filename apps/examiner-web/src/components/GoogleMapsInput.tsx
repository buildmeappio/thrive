'use client';
import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/lib/useGoogleMaps';
import { isDevelopmentOrLocal } from '@/utils/environment';
import {
  GoogleMapsPlaceData,
  GoogleMapsAutocompleteOptions,
  GoogleMapsAddressComponent,
} from '@/types/google-maps';
import { ENV } from '@/constants/variables';

interface GoogleMapsInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  onPlaceSelect?: (placeData: GoogleMapsPlaceData) => void;
  from?: string;
  province?: string; // Filter addresses by province
}

/**
 * GoogleMapsInput - Google Maps Places Autocomplete Input Component
 *
 * Provides address autocomplete functionality using Google Maps Places API
 * Returns formatted address, coordinates, and address components
 */
const GoogleMapsInput: React.FC<GoogleMapsInputProps> = ({
  value = '',
  onChange,
  label = 'Address',
  placeholder = '150 John Street, Toronto',
  required = false,
  className = '',
  error,
  onPlaceSelect,
  from,
  province,
}) => {
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isLoaded, hasError } = useGoogleMaps();
  const API_KEY = ENV.GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Ensure Google Maps API is fully loaded
    if (!isLoaded || !inputRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn('Google Maps Places API not ready yet');
      return;
    }

    // Clean up existing instance if province changed
    if (autoCompleteRef.current) {
      window.google?.maps?.event?.clearInstanceListeners(autoCompleteRef.current);
      autoCompleteRef.current = null;
    }

    try {
      // Initialize Google Maps Autocomplete for Canada only
      const autocompleteOptions: GoogleMapsAutocompleteOptions = {
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        types: ['address'],
        componentRestrictions: { country: 'CA' }, // Restrict to Canada only
      };

      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        autocompleteOptions
      );

      // Add place changed listener
      const placeChangedListener = autoCompleteRef.current?.addListener(
        'place_changed',
        handlePlaceSelect
      );

      // Cleanup listeners on unmount
      return () => {
        if (placeChangedListener) {
          window.google?.maps?.event?.removeListener(placeChangedListener);
        }
        if (autoCompleteRef.current) {
          window.google?.maps?.event?.clearInstanceListeners(autoCompleteRef.current);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, province]);

  const handlePlaceSelect = () => {
    if (!autoCompleteRef.current) return;

    try {
      const place = autoCompleteRef.current.getPlace();

      if (!place.geometry) {
        return;
      }

      // Format address in Canadian format and remove "Canada" suffix
      let formattedAddress = place.formatted_address || '';

      // Remove ", Canada" from the end of the address
      formattedAddress = formattedAddress.replace(/, Canada$/i, '');

      const placeData: GoogleMapsPlaceData = {
        formattedAddress: formattedAddress,
        latitude: place.geometry.location?.lat() || 0,
        longitude: place.geometry.location?.lng() || 0,
        components: place.address_components as GoogleMapsAddressComponent[] | undefined,
        raw: place,
      };

      // Update the input value
      if (onChange) {
        onChange(placeData.formattedAddress);
      }

      // Call the custom handler if provided
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-[${
            from === 'profile-info-form' ? '#F9F9F9' : '#F2F5F6'
          }] h-[55px] rounded-lg pl-10 pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0`}
          // Never disable the input - allow manual entry even if API fails
        />
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
      {/* Only show API key errors in local and dev environments */}
      {isDevelopmentOrLocal() && !API_KEY && (
        <div className="mt-1 text-xs text-amber-600">
          <strong>Note:</strong> Google Maps API key not configured. You can still enter your
          address manually.
        </div>
      )}
      {isDevelopmentOrLocal() && API_KEY && hasError && (
        <div className="mt-1 text-xs text-amber-600">
          <strong>Note:</strong> Address autocomplete is unavailable. You can still enter your
          address manually.
        </div>
      )}
      {API_KEY && !isLoaded && !hasError && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-gray-600"></div>
          <span>Initializing address search...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsInput;
