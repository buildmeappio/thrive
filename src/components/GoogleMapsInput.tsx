"use client";
import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { useGoogleMaps } from "@/lib/useGoogleMaps";
import { isDevelopmentOrLocal } from "@/utils/environment";
import {
  GoogleMapsPlaceData,
  GoogleMapsAutocompleteOptions,
  GoogleMapsAddressComponent,
  GoogleMapsAutocompleteInstance,
} from "@/types/google-maps";
import { ENV } from "@/constants/variables";
import { Input } from "@/components/ui/input";

interface GoogleMapsInputProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  onPlaceSelect?: (placeData: GoogleMapsPlaceData) => void;
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
  name,
  placeholder = "Enter your address",
  required = false,
  className = "",
  error,
  onPlaceSelect,
  province,
}) => {
  const autoCompleteRef = useRef<GoogleMapsAutocompleteInstance | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isLoaded, hasError } = useGoogleMaps();
  const API_KEY = ENV.GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Ensure Google Maps API is fully loaded
    if (!isLoaded || !inputRef.current) return;
    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn("Google Maps Places API not ready yet");
      return;
    }

    // Clean up existing instance if province changed
    if (autoCompleteRef.current) {
      window.google?.maps?.event?.clearInstanceListeners(
        autoCompleteRef.current as any,
      );
      autoCompleteRef.current = null;
    }

    try {
      // Initialize Google Maps Autocomplete for Canada only
      const autocompleteOptions: GoogleMapsAutocompleteOptions = {
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["address"],
        componentRestrictions: { country: "CA" }, // Restrict to Canada only
      };

      const Autocomplete = window.google.maps.places.Autocomplete;
      autoCompleteRef.current = new Autocomplete(
        inputRef.current!,
        autocompleteOptions,
      ) as GoogleMapsAutocompleteInstance;

      // Add place changed listener
      const placeChangedListener = autoCompleteRef.current?.addListener(
        "place_changed",
        handlePlaceSelect,
      );

      // Cleanup listeners on unmount
      return () => {
        if (placeChangedListener) {
          window.google?.maps?.event?.removeListener(placeChangedListener);
        }
        if (autoCompleteRef.current) {
          window.google?.maps?.event?.clearInstanceListeners(
            autoCompleteRef.current as any,
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
        components: place.address_components as
          | GoogleMapsAddressComponent[]
          | undefined,
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
      <Input
        ref={inputRef}
        icon={MapPin}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`h-14 ${error ? "ring-2 ring-red-500" : ""}`}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1 block">{error}</span>
      )}
      {/* Only show API key errors in local and dev environments */}
      {isDevelopmentOrLocal() && !API_KEY && (
        <div className="text-xs text-amber-600 mt-1">
          <strong>Note:</strong> Google Maps API key not configured. You can
          still enter your address manually.
        </div>
      )}
      {isDevelopmentOrLocal() && API_KEY && hasError && (
        <div className="text-xs text-amber-600 mt-1">
          <strong>Note:</strong> Address autocomplete is unavailable. You can
          still enter your address manually.
        </div>
      )}
      {API_KEY && !isLoaded && !hasError && (
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <span>Initializing address search...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsInput;
