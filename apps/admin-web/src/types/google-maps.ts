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
  raw: GoogleMapsPlaceResult;
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
 * Google Maps Place Result interface
 */
export interface GoogleMapsPlaceResult {
  address_components?: GoogleMapsAddressComponent[];
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  name?: string;
}

/**
 * Google Maps Autocomplete instance interface
 */
export interface GoogleMapsAutocompleteInstance {
  getPlace: () => GoogleMapsPlaceResult;
  addListener: (eventName: string, callback: () => void) => GoogleMapsMapsEventListener;
}

/**
 * Google Maps Event Listener interface
 */
export interface GoogleMapsMapsEventListener {
  remove: () => void;
}

/**
 * Window interface extension for Google Maps
 */
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            inputField: HTMLInputElement,
            options?: GoogleMapsAutocompleteOptions
          ) => GoogleMapsAutocompleteInstance;
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
          removeListener: (listener: GoogleMapsMapsEventListener) => void;
        };
      };
    };
  }
}
