import getOrganizationById from "./getOrganizationById";
import getOrganizations from "./getOrganizations";
import approveOrganization from "./approveOrganization";
import rejectOrganization from "./rejectOrganization";
import getOrganizationTypes from "./getOrganizationTypes";

const handlers = {
    getOrganizationById,
    getOrganizations,
    approveOrganization,
    rejectOrganization,
    getOrganizationTypes
}

export default handlers;