export interface CreateGroupData {
  organizationId: string;
  name: string;
  scopeType: 'ORG' | 'LOCATION_SET';
  locationIds?: string[];
  memberIds?: string[];
}

export interface UpdateGroupData {
  groupId: string;
  organizationId: string;
  name: string;
  scopeType: 'ORG' | 'LOCATION_SET';
  locationIds?: string[];
  memberIds?: string[];
}

export interface DeleteGroupParams {
  groupId: string;
  organizationId: string;
}

export interface GetOrganizationGroupsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  noPagination?: boolean;
}
