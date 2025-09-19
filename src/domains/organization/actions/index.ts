import getOrganizations from "./getOrganizations";
import getOrganizationDetails from "./getOrganizationDetails";
import approveOrganization from "./approveOrganization";
import rejectOrganization from "./rejectOrganization";
import requestMoreInfo from "./requesMoreInfo";
import getOrganizationTypes from "./getOrganizationTypes";

const organizationActions = {
    getOrganizations,
    getOrganizationDetails,
    approveOrganization,
    rejectOrganization,
    requestMoreInfo,
    getOrganizationTypes,
}

export default organizationActions;