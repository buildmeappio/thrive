import getOrganizations from "./getOrganizations";
import getOrganizationDetails from "./getOrganizationDetails";
import getOrganizationTypes from "./getOrganizationTypes";
import checkOrganizationNameExists from "./checkOrganizationNameExists";
import createOrganization from "./createOrganization";
import inviteSuperAdmin from "./inviteSuperAdmin";
import getInvitations from "./getInvitations";
import getOrganizationSuperAdmin from "./getOrganizationSuperAdmin";
import removeSuperAdmin from "./removeSuperAdmin";
import resendInvitation from "./resendInvitation";
import getOrganizationManagers from "./getOrganizationManagers";

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
};

export default organizationActions;
