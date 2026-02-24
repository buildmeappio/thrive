import { OrganizationType } from '@thrive/database';

interface OrganizationInputData {
  id: string;
  name: string;
  website?: string | null;
  type: string | null; // Now a string field, not a relation
  address: {
    id: string;
    address: string;
    street?: string | null;
    province?: string | null;
    city?: string | null;
    postalCode?: string | null;
    suite?: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  } | null;
  manager: Array<{
    account?: {
      user?: {
        email?: string;
        firstName?: string;
        lastName?: string;
      };
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationTypeData {
  id: string;
  name: string;
}

export class OrganizationDto {
  static toOrganization(data: OrganizationInputData) {
    // Convert address object to formatted string
    const formatAddress = (address: OrganizationInputData['address']): string | null => {
      if (!address) return null;

      const parts = [
        address.suite,
        address.street,
        address.city,
        address.province,
        address.postalCode,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(', ') : address.address;
    };

    return {
      id: data.id,
      name: data.name,
      website: data.website,
      typeName: data.type || null, // type is now a string field
      address: formatAddress(data.address),
      managerName: data.manager[0]?.account?.user
        ? `${data.manager[0].account.user.firstName} ${data.manager[0].account.user.lastName}`
        : undefined,
      managerEmail: data.manager[0]?.account?.user?.email,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    };
  }

  static toOrganizationTypes(data: OrganizationType): OrganizationTypeData {
    return {
      id: data.id,
      name: data.name,
    };
  }
}
