import getOrganizations from './getOrganizations';
import getOrganizationDetails from './getOrganizationDetails';
import getOrganizationTypes from './getOrganizationTypes';
import checkOrganizationNameExists from './checkOrganizationNameExists';
import createOrganization from './createOrganization';
import inviteSuperAdmin from './inviteSuperAdmin';
import getInvitations from './getInvitations';
import getOrganizationSuperAdmin from './getOrganizationSuperAdmin';
import removeSuperAdmin from './removeSuperAdmin';
import resendInvitation from './resendInvitation';
import getOrganizationManagers from './getOrganizationManagers';
import getOrganizationUsers from './getOrganizationUsers';
import revokeInvitation from './revokeInvitation';
import activateUser from './activateUser';
import deactivateUser from './deactivateUser';
import modifyUserAccess from './modifyUserAccess';
import updateOrganizationHqAddress from './updateOrganizationHqAddress';
import updateOrganizationDetails from './updateOrganizationDetails';
import importUsersFromCSV from './importUsersFromCSV';
import exportUsersToCSV from './exportUsersToCSV';

const organizationActions = {
  getOrganizations,
  getOrganizationDetails,
  getOrganizationTypes,
  checkOrganizationNameExists,
  createOrganization,
  inviteSuperAdmin,
  getInvitations,
  getOrganizationSuperAdmin,
  removeSuperAdmin,
  resendInvitation,
  getOrganizationManagers,
  getOrganizationUsers,
  revokeInvitation,
  activateUser,
  deactivateUser,
  modifyUserAccess,
  updateOrganizationHqAddress,
  updateOrganizationDetails,
  importUsersFromCSV,
  exportUsersToCSV,
};

export default organizationActions;
