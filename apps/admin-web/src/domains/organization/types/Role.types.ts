export interface CreateRoleData {
  organizationId: string;
  name: string;
  key: string;
  description?: string;
  isDefault?: boolean;
}

export interface UpdateRoleData {
  roleId: string;
  organizationId: string;
  name: string;
  key: string;
  description?: string;
  isDefault?: boolean;
}

export interface DeleteRoleParams {
  roleId: string;
  organizationId: string;
}

export interface GetOrganizationRolesParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  noPagination?: boolean;
}

export interface GetRolePermissionsParams {
  roleId: string;
  organizationId: string;
}

export interface AssignPermissionsData {
  roleId: string;
  organizationId: string;
  permissionIds: string[];
}
