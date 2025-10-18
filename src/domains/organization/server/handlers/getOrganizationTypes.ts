import { OrganizationDto } from "../dto/organizations.dto";
import organizationsService from "../organizations.service";

const getOrganizations = async (): Promise<any[]> => {
    const types = await organizationsService.listOrganizationTypes();
    console.log("tyes of org", types);

    return types.map(OrganizationDto.toOrganizationTypes);
};

export default getOrganizations;
