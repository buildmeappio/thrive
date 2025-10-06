import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import type { FieldError, UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
  }
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
  onPlaceSelect?: (placeData: any) => void;
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
        color: ##000000;
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

  const handlePlaceSelect = () => {
    if (!autoCompleteRef.current) return;

    try {
      const place = autoCompleteRef.current.getPlace();

      if (!place.geometry) {
        return;
      }

      const placeData = {
        formattedAddress: place.formatted_address,
        latitude: place.geometry.location?.lat(),
        longitude: place.geometry.location?.lng(),
        components: place.address_components,
        raw: place,
      };

      // Update field value using React Hook Form's setValue
      if (setValue) {
        setValue(name, place.formatted_address, { shouldValidate: true });

        // Optionally set latitude/longitude if they exist in form
        setValue('latitude', placeData.latitude);
        setValue('longitude', placeData.longitude);
      } else if (onChange) {
        onChange(place.formatted_address || '');
      }

      // Trigger validation after setting value
      if (trigger) {
        trigger(name);
      }

      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
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
        <label className={`mb-2 block text-sm`}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            `h-[45px] w-full rounded-[10px] bg-[#F2F5F6] text-sm text-[#333] md:h-[55px] ${className}`,
            'placeholder:text-[14px] placeholder:leading-none placeholder:font-normal placeholder:text-[#9EA9AA]',
            'focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'pr-4 pl-8 sm:pr-6'
          )}
        />
      </div>
      {errorMessage && <span className="mt-1 text-xs text-red-500">{errorMessage}</span>}
    </div>
  );
};

export default GoogleMapsInput;
