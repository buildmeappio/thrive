import { useState, useEffect } from 'react';
import { ENV } from '@/constants/variables';

const SCRIPT_ID = 'google-maps-script';

// Module-level state to prevent duplicate script loading
let scriptLoadingPromise: Promise<void> | null = null;
let isScriptLoaded = false;

/**
 * useGoogleMaps Hook
 *
 * Loads Google Maps JavaScript API with Places library efficiently
 * Prevents duplicate script loading across multiple component instances
 * Returns loading state to conditionally render components
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const API_KEY = ENV.GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Check if API key is available
    if (!API_KEY) {
      console.error('NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not defined');
      setHasError(true);
      return;
    }

    // If Google Maps is already loaded, set state immediately
    if (isScriptLoaded && window.google?.maps?.places?.Autocomplete) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // If script is already loading, wait for it
    if (scriptLoadingPromise) {
      scriptLoadingPromise
        .then(() => {
          if (window.google?.maps?.places?.Autocomplete) {
            setIsLoaded(true);
            setHasError(false);
          } else {
            setHasError(true);
          }
        })
        .catch(() => {
          setHasError(true);
        });
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      // Script exists, wait for it to load
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      const checkLoaded = () => {
        if (window.google?.maps?.places?.Autocomplete) {
          isScriptLoaded = true;
          setIsLoaded(true);
          setHasError(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkLoaded, 100);
        } else {
          setHasError(true);
          console.error('Google Maps API failed to load after timeout');
        }
      };
      checkLoaded();
      return;
    }

    // Create and load the script (only once)
    scriptLoadingPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      script.onload = () => {
        // Wait for the places library to fully initialize
        const checkPlacesReady = () => {
          if (window.google?.maps?.places?.Autocomplete) {
            isScriptLoaded = true;
            setIsLoaded(true);
            setHasError(false);
            resolve();
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkPlacesReady, 100);
          } else {
            setHasError(true);
            console.error('Google Maps Places API failed to initialize');
            reject(new Error('Google Maps Places API failed to initialize'));
          }
        };
        checkPlacesReady();
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setHasError(true);
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });

    // Subscribe to the loading promise
    scriptLoadingPromise
      .then(() => {
        if (window.google?.maps?.places?.Autocomplete) {
          setIsLoaded(true);
          setHasError(false);
        }
      })
      .catch(() => {
        setHasError(true);
      });

    // No cleanup - we keep the script loaded for other components
  }, [API_KEY]);

  return { isLoaded, hasError };
};
