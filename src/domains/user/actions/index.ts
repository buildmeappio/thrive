import listUsers from './listUsers';
import toggleUserStatus from './toggleUserStatus';
import sendInvitation from './sendInvitation';
import getOrganizationRoles from './getOrganizationRoles';

const userActions = {
  listUsers,
  toggleUserStatus,
  sendInvitation,
  getOrganizationRoles,
};

export default userActions;
export { listUsers, toggleUserStatus, sendInvitation, getOrganizationRoles };
