import { useState, useEffect } from "react";
import { ENV } from "@/constants/variables";

const SCRIPT_ID = "google-maps-script";

/**
 * useGoogleMaps Hook
 *
 * Loads Google Maps JavaScript API with Places library efficiently
 * Returns loading state to conditionally render components
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const API_KEY = ENV.GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Check if API key is available
    if (!API_KEY) {
      console.error("NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not defined");
      return;
    }

    // If Google Maps is already loaded, set state immediately
    if (window.google?.maps?.places?.Autocomplete) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already loading or loaded
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = () => {
        if (window.google?.maps?.places?.Autocomplete) {
          setIsLoaded(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Wait for the places library to fully initialize
      const checkPlacesReady = () => {
        if (window.google?.maps?.places?.Autocomplete) {
          setIsLoaded(true);
        } else {
          setTimeout(checkPlacesReady, 100);
        }
      };
      checkPlacesReady();
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const scriptToRemove = document.getElementById(SCRIPT_ID);
      if (scriptToRemove && !window.google?.maps) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [API_KEY]);

  return { isLoaded };
};
