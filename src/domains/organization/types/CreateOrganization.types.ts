export interface CreateOrganizationInput {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateOrganizationResult {
  success: boolean;
  organizationId?: string;
  error?: string;
}
