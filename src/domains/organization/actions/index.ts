import getOrganizations from "./getOrganizations";
import getOrganizationDetails from "./getOrganizationDetails";
import approveOrganization from "./approveOrganization";
import rejectOrganization from "./rejectOrganization";
import requestMoreInfo from "./requesMoreInfo";
import getOrganizationTypes from "./getOrganizationTypes";
import checkOrganizationNameExists from "./checkOrganizationNameExists";
import createOrganization from "./createOrganization";

const organizationActions = {
  getOrganizations,
  getOrganizationDetails,
  approveOrganization,
  rejectOrganization,
  requestMoreInfo,
  getOrganizationTypes,
  checkOrganizationNameExists,
  createOrganization,
};

export default organizationActions;
