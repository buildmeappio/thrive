/**
 * Google Maps API types
 */

/**
 * Google Maps address component
 */
export interface GoogleMapsAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Google Maps place data structure
 */
export interface GoogleMapsPlaceData {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  components: GoogleMapsAddressComponent[] | undefined;
  raw: google.maps.places.PlaceResult;
}

/**
 * Google Maps Autocomplete options
 */
export interface GoogleMapsAutocompleteOptions {
  fields: string[];
  types: string[];
  componentRestrictions?: {
    country: string;
  };
}

/**
 * Window interface extension for Google Maps
 */
declare global {
  interface Window {
    google: typeof google;
  }
}

