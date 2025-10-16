/**
 * Google Maps Service
 *
 * Server-side service for Google Maps Geocoding API
 * Used to validate addresses and get coordinates on the backend
 */

interface GeocodeResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  addressComponents: any[];
  placeId: string;
}

interface GeocodeResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: any[];
    place_id: string;
  }>;
  status: string;
}

class GoogleMapsService {
  private apiKey: string;
  private baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
    if (!this.apiKey) {
      console.warn(
        "GOOGLE_MAPS_API_KEY is not set. Geocoding features will not work."
      );
    }
  }

  /**
   * Geocode an address to get coordinates
   * @param address - The address to geocode
   * @returns Geocoded result with coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append("address", address);
      url.searchParams.append("key", this.apiKey);
      url.searchParams.append("region", "ca"); // Bias to Canada

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }

      const data: GeocodeResponse = await response.json();

      if (data.status !== "OK" || !data.results.length) {
        console.error("Geocoding failed:", data.status);
        return null;
      }

      const result = data.results[0];

      return {
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        addressComponents: result.address_components,
        placeId: result.place_id,
      };
    } catch (error) {
      console.error("Error geocoding address:", error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get an address
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @returns Geocoded result with address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append("latlng", `${latitude},${longitude}`);
      url.searchParams.append("key", this.apiKey);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.statusText}`);
      }

      const data: GeocodeResponse = await response.json();

      if (data.status !== "OK" || !data.results.length) {
        console.error("Reverse geocoding failed:", data.status);
        return null;
      }

      const result = data.results[0];

      return {
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        addressComponents: result.address_components,
        placeId: result.place_id,
      };
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      throw error;
    }
  }

  /**
   * Validate if an address is in Canada
   * @param address - The address to validate
   * @returns true if address is in Canada, false otherwise
   */
  async isCanadianAddress(address: string): Promise<boolean> {
    try {
      const result = await this.geocodeAddress(address);
      if (!result) return false;

      // Check if any address component has country: CA
      const hasCanada = result.addressComponents.some(
        (component: any) =>
          component.types.includes("country") && component.short_name === "CA"
      );

      return hasCanada;
    } catch (error) {
      console.error("Error validating Canadian address:", error);
      return false;
    }
  }

  /**
   * Get province from address
   * @param address - The address to parse
   * @returns Province short code (e.g., "ON", "BC") or null
   */
  async getProvinceFromAddress(address: string): Promise<string | null> {
    try {
      const result = await this.geocodeAddress(address);
      if (!result) return null;

      // Find the administrative_area_level_1 (province/state)
      const provinceComponent = result.addressComponents.find(
        (component: any) =>
          component.types.includes("administrative_area_level_1")
      );

      return provinceComponent?.short_name || null;
    } catch (error) {
      console.error("Error extracting province from address:", error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   * Uses Haversine formula
   * @param lat1 - Latitude of first point
   * @param lon1 - Longitude of first point
   * @param lat2 - Latitude of second point
   * @param lon2 - Longitude of second point
   * @returns Distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
