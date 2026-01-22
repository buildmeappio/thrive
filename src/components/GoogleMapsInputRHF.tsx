import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import type { FieldError, UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
  }
}

interface ParsedAddress {
  formattedAddress: string;
  streetAddress: string;
  aptUnitSuite?: string;
  city: string;
  postalCode: string;
  province: string;
  latitude?: number;
  longitude?: number;
  components: any[];
  raw: any;
}

interface GoogleMapsInputProps {
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: FieldError | string;
  onPlaceSelect?: (placeData: ParsedAddress) => void;
  from?: string;
  setValue?: UseFormSetValue<any>;
  trigger?: UseFormTrigger<any>;
}

const GoogleMapsInput: React.FC<GoogleMapsInputProps> = ({
  value,
  onChange,
  name,
  label = 'Address',
  placeholder = '150 John Street, Toronto',
  required = false,
  className = '',
  error,
  onPlaceSelect,
  setValue,
  trigger,
}) => {
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isLoaded } = useGoogleMaps();

  const [localValue, setLocalValue] = useState(value || '');
  const isSelectingRef = useRef(false);

  useEffect(() => {
    if (!isSelectingRef.current && value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['address_components', 'formatted_address', 'geometry'],
        types: ['address'],
        componentRestrictions: { country: 'ca' },
      });

      const placeChangedListener = autoCompleteRef.current?.addListener(
        'place_changed',
        handlePlaceSelect
      );

      addDropdownStyles();

      return () => {
        if (placeChangedListener) {
          google.maps.event.removeListener(placeChangedListener);
        }
        if (autoCompleteRef.current) {
          google.maps.event.clearInstanceListeners(autoCompleteRef.current);
        }
        removeDropdownStyles();
      };
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
    }
  }, [isLoaded]);

  const addDropdownStyles = () => {
    removeDropdownStyles();

    const style = document.createElement('style');
    style.id = 'google-maps-dropdown-styles';
    style.textContent = `
      .pac-container {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        margin-top: 4px;
        overflow: hidden;
        z-index: 9999;
      }
      
      .pac-item {
        background: white;
        border-top: none;
        cursor: pointer;
        line-height: 30px;
        padding: 12px 16px;
        font-size: 14px;
        color: #000000; 
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .pac-item:hover,
      .pac-item-selected {
        background-color: #f9fafb;
        color: #000000; 
      }

      .pac-item:last-child {
        border-bottom: none;
      }
      
      .pac-item-query {
        font-size: 14px;
        font-weight: 500;
        color: #000000;
      }
      
      .pac-matched {
        font-weight: 600;
        color: #000000;
      }
      
      .pac-icon {
        background-image: none;
        width: 16px;
        height: 16px;
        margin-right: 12px;
        margin-top: 7px;
        background: #000000;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3C/svg%3E") no-repeat center;
        mask-size: contain;
      }
      
      .pac-item:hover .pac-icon,
      .pac-item-selected .pac-icon {
        background: #000000;
      }
      
      .pac-logo::after {
        display: none;
      }
      
      .pac-item .pac-item-query .pac-matched {
        color: #000000;
      }
    `;

    document.head.appendChild(style);
  };

  const removeDropdownStyles = () => {
    const existingStyle = document.getElementById('google-maps-dropdown-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  };

  const parseAddressComponents = (addressComponents: any): ParsedAddress => {
    let streetNumber = '';
    let route = '';
    let city = '';
    let postalCode = '';
    let province = '';

    addressComponents?.forEach((component: any) => {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        route = component.long_name;
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        province = component.short_name;
      }
    });

    const streetAddress = `${streetNumber} ${route}`.trim();

    return {
      formattedAddress: '',
      streetAddress,
      city,
      postalCode,
      province,
      components: addressComponents,
      raw: null,
    };
  };

  const handlePlaceSelect = () => {
    if (!autoCompleteRef.current) return;

    try {
      isSelectingRef.current = true;
      const place = autoCompleteRef.current.getPlace();

      if (!place.geometry) {
        isSelectingRef.current = false;
        return;
      }

      const formattedAddress = place.formatted_address || '';

      // Parse address components using the new function
      const parsedAddress = parseAddressComponents(place.address_components);

      const placeData: ParsedAddress = {
        ...parsedAddress,
        formattedAddress,
        latitude: place.geometry.location?.lat(),
        longitude: place.geometry.location?.lng(),
        raw: place,
      };

      // Update local state immediately
      setLocalValue(formattedAddress);

      // Update field value using React Hook Form's setValue
      if (setValue) {
        setValue(name, formattedAddress, { shouldValidate: true });

        // Optionally set latitude/longitude if they exist in form
        setValue('latitude', placeData.latitude);
        setValue('longitude', placeData.longitude);
      } else if (onChange) {
        onChange(formattedAddress);
      }

      // Trigger validation after setting value
      if (trigger) {
        trigger(name);
      }

      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }

      // Reset the flag after a short delay to allow state updates to complete
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 100);
    } catch (error) {
      console.error('Error handling place selection:', error);
      isSelectingRef.current = false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (setValue) {
      setValue(name, newValue, { shouldValidate: false });
    } else if (onChange) {
      onChange(newValue);
    }
  };

  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="space-y-2">
      {label && (
        <label className="font-poppins text-sm font-medium text-[#000000]">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#4D4D4D]" />
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            `h-11 w-full rounded-[10px] bg-[#F2F5F6] text-sm text-[#000000] ${className}`,
            'placeholder:text-sm placeholder:font-normal placeholder:text-[#4D4D4D]',
            'focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'pr-4 pl-10 sm:pr-6'
          )}
        />
      </div>
      {errorMessage && <span className="font-poppins text-xs text-red-500">{errorMessage}</span>}
    </div>
  );
};

export default GoogleMapsInput;
