import { OrganizationDto, OrganizationTypeData } from "../dto/organizations.dto";
import organizationsService from "../organizations.service";
import logger from "@/utils/logger";

const getOrganizations = async (): Promise<OrganizationTypeData[]> => {
    const types = await organizationsService.listOrganizationTypes();
    logger.log("tyes of org", types);

    return types.map(OrganizationDto.toOrganizationTypes);
};

export default getOrganizations;
