import { useState, useEffect } from "react";
import { ENV } from "@/constants/variables";

const SCRIPT_ID = "google-maps-script";

/**
 * useGoogleMaps Hook
 *
 * Loads Google Maps JavaScript API with Places library
 * Returns loading state to conditionally render components
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const API_KEY = ENV.GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!API_KEY) {
      console.error("NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not defined");
      return;
    }

    // If script is already loaded, set state to loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // If script is loading, wait for it
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      return;
    }

    // If no script exists, create and load it
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", () => setIsLoaded(true));
    script.addEventListener("error", () => {
      console.error("Failed to load Google Maps script");
    });

    document.head.appendChild(script);

    return () => {
      // Cleanup only if script was added by this instance
      const scriptToRemove = document.getElementById(SCRIPT_ID);
      if (scriptToRemove && !window.google?.maps) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [API_KEY]);

  return { isLoaded };
};
