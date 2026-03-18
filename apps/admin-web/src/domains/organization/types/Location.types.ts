export interface LocationAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateLocationData {
  organizationId: string;
  name: string;
  address: LocationAddress;
  timezone: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}

export interface UpdateLocationData {
  locationId: string;
  organizationId: string;
  name: string;
  address: LocationAddress;
  timezone: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}

export interface DeleteLocationParams {
  locationId: string;
  organizationId: string;
}

export interface ToggleLocationStatusParams {
  locationId: string;
  organizationId: string;
}

export interface GetOrganizationLocationsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  noPagination?: boolean;
}
