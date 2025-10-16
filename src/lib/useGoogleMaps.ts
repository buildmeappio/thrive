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
    // Check if API key is available
    if (!API_KEY) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not defined in environment variables"
      );
      console.log("Available ENV keys:", Object.keys(ENV));
      console.log("ENV.GOOGLE_PLACES_API_KEY:", ENV.GOOGLE_PLACES_API_KEY);
      return;
    }

    // If script is already loaded, set state to loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // If script is loading, wait for it
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      const handleLoad = () => {
        // Wait for places library to be available
        if (window.google?.maps?.places) {
          setIsLoaded(true);
        } else {
          // Retry after a short delay
          setTimeout(() => {
            if (window.google?.maps?.places) {
              setIsLoaded(true);
            }
          }, 100);
        }
      };

      existingScript.addEventListener("load", handleLoad);
      return;
    }

    // If no script exists, create and load it
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    console.log("Loading Google Maps script:", script.src);

    script.addEventListener("load", () => {
      console.log("Google Maps script loaded, checking for Places library...");
      console.log("window.google:", window.google);
      console.log("window.google.maps:", window.google?.maps);
      console.log("window.google.maps.places:", window.google?.maps?.places);

      // Wait a bit to ensure places library is fully initialized
      setTimeout(() => {
        if (window.google?.maps?.places) {
          console.log("✅ Google Maps Places library loaded successfully");
          setIsLoaded(true);
        } else {
          console.error("❌ Google Maps Places library failed to load");
          console.error("This usually means:");
          console.error("1. Invalid API key");
          console.error("2. Places API not enabled in Google Cloud Console");
          console.error("3. Domain not whitelisted in API key restrictions");
        }
      }, 100);
    });

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
