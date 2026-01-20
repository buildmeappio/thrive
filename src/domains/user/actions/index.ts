import listUsers from './listUsers';
import listInvitations from './listInvitations';
import toggleUserStatus from './toggleUserStatus';
import sendInvitation from './sendInvitation';
import getOrganizationRoles from './getOrganizationRoles';
import { assignRole } from './assignRole';
import { grantRoleException } from './grantRoleException';
import { revokeRoleException } from './revokeRoleException';
import { getUserRoleGrants } from './getUserRoleGrants';

const userActions = {
  listUsers,
  listInvitations,
  toggleUserStatus,
  sendInvitation,
  getOrganizationRoles,
  assignRole,
  grantRoleException,
  revokeRoleException,
  getUserRoleGrants,
};

export default userActions;
export {
  listUsers,
  listInvitations,
  toggleUserStatus,
  sendInvitation,
  getOrganizationRoles,
  assignRole,
  grantRoleException,
  revokeRoleException,
  getUserRoleGrants,
};
