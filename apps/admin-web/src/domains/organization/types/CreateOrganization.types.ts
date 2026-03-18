export interface CreateOrganizationInput {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationType?: string;
  organizationSize?: string;
  website?: string;
  timezone?: string;
  hqAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    county?: string;
    latitude?: number;
    longitude?: number;
  };
  hqAddressTimezone?: string;
}

export interface CreateOrganizationResult {
  success: boolean;
  organizationId?: string;
  error?: string;
}
