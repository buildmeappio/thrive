"use server";

import * as OrganizationsService from "../organizations.service";
import { OrganizationDto } from "../dto/organizations.dto";

export default async function requestMoreInfoOrganization(id: string) {
    const org = await OrganizationsService.requestMoreInfoOrganization(id);
    return OrganizationDto.toOrganization(org);
}

