import getOrganizationById from "./getOrganizationById";
import getOrganizations from "./getOrganizations";
import approveOrganization from "./approveOrganization";
import rejectOrganization from "./rejectOrganization";
import getOrganizationTypes from "./getOrganizationTypes";
import requestMoreInfoOrganization from "./requestMoreInfoOrganization";
import checkOrganizationNameExists from "./checkOrganizationNameExists";
import createOrganization from "./createOrganization";

const handlers = {
  getOrganizationById,
  getOrganizations,
  approveOrganization,
  rejectOrganization,
  getOrganizationTypes,
  requestMoreInfoOrganization,
  checkOrganizationNameExists,
  createOrganization,
};

export default handlers;
