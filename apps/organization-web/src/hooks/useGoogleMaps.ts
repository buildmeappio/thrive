import { useState, useEffect, useCallback } from 'react';
import env from '../config/env';

const SCRIPT_ID = 'google-maps-script';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const API_KEY = env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!API_KEY) {
      setLoadError('Google Maps API key is not configured');
      return;
    }

    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    (window as any).initGoogleMaps = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
      } else {
        setLoadError('Google Maps Places library failed to initialize');
      }
    };

    const handleError = () => setLoadError('Failed to load Google Maps script');
    script.addEventListener('error', handleError);

    return () => {
      script?.removeEventListener('error', handleError);
      delete (window as any).initGoogleMaps;
    };
  }, [API_KEY]);

  /**
   * Create Autocomplete restricted to Canada 🇨🇦
   */
  const createAutocomplete = useCallback(
    (
      input: HTMLInputElement,
      fields: string[] = ['place_id', 'geometry', 'name', 'formatted_address']
    ) => {
      if (!isLoaded || !window.google?.maps?.places) {
        console.warn('Google Maps not loaded yet');
        return null;
      }

      return new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'ca' }, // restrict to Canada
        fields,
      });
    },
    [isLoaded]
  );

  return { isLoaded, loadError, createAutocomplete };
};
