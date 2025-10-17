"use client";
import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { useGoogleMaps } from "@/lib/useGoogleMaps";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapsInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  onPlaceSelect?: (placeData: {
    formattedAddress: string;
    latitude: number;
    longitude: number;
    components: any;
    raw: any;
  }) => void;
  from?: string;
}

/**
 * GoogleMapsInput - Google Maps Places Autocomplete Input Component
 *
 * Provides address autocomplete functionality using Google Maps Places API
 * Returns formatted address, coordinates, and address components
 */
const GoogleMapsInput: React.FC<GoogleMapsInputProps> = ({
  value = "",
  onChange,
  label = "Address",
  placeholder = "150 John Street, Toronto",
  required = false,
  className = "",
  error,
  onPlaceSelect,
  from,
}) => {
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    // Ensure Google Maps API is fully loaded
    if (!isLoaded || !inputRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn("Google Maps Places API not ready yet");
      return;
    }

    // Skip if already initialized
    if (autoCompleteRef.current) return;

    try {
      // Initialize Google Maps Autocomplete
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["address_components", "formatted_address", "geometry"],
          types: ["address"],
          componentRestrictions: { country: "ca" }, // Restrict to Canada
        }
      );

      // Add place changed listener
      const placeChangedListener = autoCompleteRef.current?.addListener(
        "place_changed",
        handlePlaceSelect
      );

      // Cleanup listeners on unmount
      return () => {
        if (placeChangedListener) {
          window.google?.maps?.event?.removeListener(placeChangedListener);
        }
        if (autoCompleteRef.current) {
          window.google?.maps?.event?.clearInstanceListeners(
            autoCompleteRef.current
          );
        }
      };
    } catch (error) {
      console.error("Error initializing Google Maps Autocomplete:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const handlePlaceSelect = () => {
    if (!autoCompleteRef.current) return;

    try {
      const place = autoCompleteRef.current.getPlace();

      if (!place.geometry) {
        return;
      }

      const placeData = {
        formattedAddress: place.formatted_address || "",
        latitude: place.geometry.location?.lat() || 0,
        longitude: place.geometry.location?.lng() || 0,
        components: place.address_components,
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
      console.error("Error handling place selection:", error);
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
        <label className="block text-sm mb-2 font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-[${
            from === "profile-info-form" ? "#F9F9F9" : "#F2F5F6"
          }] h-[55px] rounded-lg pl-10 pr-4 focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none`}
          disabled={!isLoaded}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-1 block">{error}</span>
      )}
      {!isLoaded && (
        <span className="text-xs text-gray-500 mt-1 block">
          Loading Google Maps...
        </span>
      )}
    </div>
  );
};

export default GoogleMapsInput;
