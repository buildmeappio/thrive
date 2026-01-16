export interface CreateOrganizationInput {
  organizationTypeName: string; // The name of the organization type
  organizationName: string;
  addressLookup: string; // Full address from Google Maps
  streetAddress: string;
  aptUnitSuite?: string;
  city: string;
  postalCode: string;
  province: string;
  organizationWebsite?: string;
}

export interface CreateOrganizationResult {
  success: boolean;
  organizationId?: string;
  error?: string;
}
