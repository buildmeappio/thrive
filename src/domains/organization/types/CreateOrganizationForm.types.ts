export interface CreateOrganizationFormData {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateOrganizationFormErrors {
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface CreateOrganizationFormProps {
  createOrganizationAction: (data: {
    organizationName: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<{ success: boolean; organizationId?: string; error?: string }>;
}
