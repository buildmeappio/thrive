export interface CreateOrganizationFormData {
  organizationType: string;
  organizationName: string;
  addressLookup: string;
  streetAddress: string;
  aptUnitSuite: string;
  city: string;
  postalCode: string;
  province: string;
  organizationWebsite: string;
}

export interface CreateOrganizationFormErrors {
  organizationType?: string;
  organizationName?: string;
  addressLookup?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
}

export interface CreateOrganizationFormProps {
  organizationTypes: string[];
  createOrganizationAction: (data: {
    organizationTypeName: string;
    organizationName: string;
    addressLookup: string;
    streetAddress: string;
    aptUnitSuite?: string;
    city: string;
    postalCode: string;
    province: string;
    organizationWebsite?: string;
  }) => Promise<{ success: boolean; organizationId?: string; error?: string }>;
}
