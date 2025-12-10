"use client";
import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { useGoogleMaps } from "@/lib/useGoogleMaps";
import { GoogleMapsPlaceData, GoogleMapsAutocompleteOptions, GoogleMapsAddressComponent } from "@/types/google-maps";

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
  value = "",
  onChange,
  label = "Address",
  placeholder = "150 John Street, Toronto",
  required = false,
  className = "",
  error,
  onPlaceSelect,
  from,
  province,
}) => {
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isLoaded } = useGoogleMaps();
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Ensure Google Maps API is fully loaded
    if (!isLoaded || !inputRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn("Google Maps Places API not ready yet");
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
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["address"],
        componentRestrictions: { country: "CA" }, // Restrict to Canada only
      };

      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        autocompleteOptions
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
  }, [isLoaded, province]);

  const handlePlaceSelect = () => {
    if (!autoCompleteRef.current) return;

    try {
      const place = autoCompleteRef.current.getPlace();

      if (!place.geometry) {
        return;
      }

      // Format address in Canadian format and remove "Canada" suffix
      let formattedAddress = place.formatted_address || "";

      // Remove ", Canada" from the end of the address
      formattedAddress = formattedAddress.replace(/, Canada$/i, "");

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
      {!API_KEY && (
        <div className="text-xs text-amber-600 mt-1">
          <strong>Note:</strong> Google Maps API key not configured. Please set
          NEXT_PUBLIC_GOOGLE_PLACES_API_KEY in your environment variables.
        </div>
      )}
      {API_KEY && !isLoaded && (
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <span>Initializing address search...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsInput;
