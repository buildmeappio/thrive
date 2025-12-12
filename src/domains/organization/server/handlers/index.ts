import getOrganizationById from "./getOrganizationById";
import getOrganizations from "./getOrganizations";
import approveOrganization from "./approveOrganization";
import rejectOrganization from "./rejectOrganization";
import getOrganizationTypes from "./getOrganizationTypes";
import requestMoreInfoOrganization from "./requestMoreInfoOrganization";

const handlers = {
  getOrganizationById,
  getOrganizations,
  approveOrganization,
  rejectOrganization,
  getOrganizationTypes,
  requestMoreInfoOrganization,
};

export default handlers;
