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
import activateUser from './activateUser';
import deactivateUser from './deactivateUser';

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
};

export default handlers;
