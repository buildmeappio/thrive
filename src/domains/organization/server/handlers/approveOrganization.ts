"use server";

import organizationsService from "../organizations.service";
import { OrganizationDto } from "../dto/organizations.dto";

export default async function approveOrganization(id: string, userId: string) {
    const org = await organizationsService.approveOrganization(id, userId);
    return OrganizationDto.toOrganization(org);
}
