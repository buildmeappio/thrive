export interface CreateOrganizationFormData {
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

export interface CreateOrganizationFormErrors {
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  organizationType?: string;
  organizationSize?: string;
  website?: string;
  timezone?: string;
  hqAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  hqAddressTimezone?: string;
}

export interface CreateOrganizationFormProps {
  /** When false, content is not wrapped in DashboardShell (e.g. when layout already provides it). Default true. */
  wrapInShell?: boolean;
  createOrganizationAction: (data: {
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
  }) => Promise<{ success: boolean; organizationId?: string; error?: string }>;
}
