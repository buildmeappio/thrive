"use server";

import organizationsService from "../organizations.service";
import { OrganizationDto } from "../dto/organizations.dto";

export default async function requestMoreInfoOrganization(id: string) {
    const org = await organizationsService.requestMoreInfoOrganization(id);
    return OrganizationDto.toOrganization(org);
}

