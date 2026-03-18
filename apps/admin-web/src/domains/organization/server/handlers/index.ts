import getOrganizationById from './getOrganizationById';
import getOrganizations from './getOrganizations';
import getOrganizationTypes from './getOrganizationTypes';
import checkOrganizationNameExists from './checkOrganizationNameExists';
import createOrganization from './createOrganization';
import inviteSuperAdmin from './inviteSuperAdmin';
import getInvitations from './getInvitations';
import getOrganizationSuperAdmin from './getOrganizationSuperAdmin';
import removeSuperAdmin from './removeSuperAdmin';
import resendInvitation from './resendInvitation';
import revokeInvitation from './revokeInvitation';
import importRolesFromCSV from './importRolesFromCSV';
import exportRolesToCSV from './exportRolesToCSV';
import importLocationsFromCSV from './importLocationsFromCSV';
import exportLocationsToCSV from './exportLocationsToCSV';
import activateUser from './activateUser';
import deactivateUser from './deactivateUser';
import modifyUserAccess from './modifyUserAccess';

const handlers = {
  getOrganizationById,
  getOrganizations,
  getOrganizationTypes,
  checkOrganizationNameExists,
  createOrganization,
  inviteSuperAdmin,
  getInvitations,
  getOrganizationSuperAdmin,
  removeSuperAdmin,
  resendInvitation,
  revokeInvitation,
  activateUser,
  deactivateUser,
  modifyUserAccess,
  importRolesFromCSV,
  exportRolesToCSV,
  importLocationsFromCSV,
  exportLocationsToCSV,
};

export default handlers;
