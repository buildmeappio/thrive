import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapsInputProps {
  value?: string;
  onChange?: (value: string) => void;
  formik?: any;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string | null;
  onPlaceSelect?: (placeData: any) => void;
  from?: string;
}

const GoogleMapsInput: React.FC<GoogleMapsInputProps> = ({
  value,
  onChange,
  formik,
  name,
  label = 'Address',
  placeholder = '150 John Street, Toronto',
  required = false,
  className = '',
  error = null,
  onPlaceSelect,
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

      // Add custom styling to the dropdown
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const addDropdownStyles = () => {
    // Remove existing styles if they exist
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
        color: #374151;
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s ease;
      }
      
      .pac-item:hover,
      .pac-item-selected {
        background-color: #f9fafb;
        color: #111827;
      }
      
      .pac-item:last-child {
        border-bottom: none;
      }
      
      .pac-item-query {
        font-size: 14px;
        font-weight: 500;
        color: #111827;
      }
      
      .pac-matched {
        font-weight: 600;
        color: #A6EC0A;
      }
      
      .pac-icon {
        background-image: none;
        width: 16px;
        height: 16px;
        margin-right: 12px;
        margin-top: 7px;
        background: #6b7280;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3C/svg%3E") no-repeat center;
        mask-size: contain;
      }
      
      .pac-item:hover .pac-icon,
      .pac-item-selected .pac-icon {
        background: #A6EC0A;
      }
      
      /* Hide Google logo */
      .pac-logo::after {
        display: none;
      }
      
      /* Style the separator */
      .pac-item .pac-item-query .pac-matched {
        color: #A6EC0A;
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

      if (formik && name) {
        formik.setFieldValue(name, place.formatted_address);
        if (formik.values.hasOwnProperty('latitude')) {
          formik.setFieldValue('latitude', placeData.latitude);
        }
        if (formik.values.hasOwnProperty('longitude')) {
          formik.setFieldValue('longitude', placeData.longitude);
        }
      } else if (onChange) {
        onChange(place.formatted_address || '');
      }

      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  };

  const inputValue = formik && name ? formik.values[name] : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (formik && name) {
      formik.setFieldValue(name, newValue);
    } else if (onChange) {
      onChange(newValue);
    }
  };

  const errorMessage = error || (name && formik?.touched[name] && formik?.errors[name]);

  return (
    <div className={className}>
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
          value={inputValue || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="text-black-2 w-full rounded-xl bg-[#F2F5F6] py-3 pr-4 pl-0 transition-colors duration-200 focus:border-[#A6EC0A] focus:outline-none sm:pr-6 sm:pl-8"
          {...(formik && name && { onBlur: formik.handleBlur })}
        />
      </div>
      {errorMessage && <span className="mt-1 text-xs text-red-500">{errorMessage}</span>}
    </div>
  );
};

export default GoogleMapsInput;
