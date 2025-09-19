"use server";

import organizationsService from "../organizations.service";
import { OrganizationDto } from "../dto/organizations.dto";

export default async function rejectOrganization(id: string, userId: string, reason: string) {
    const org = await organizationsService.rejectOrganization(
        id,
        userId,
        reason?.trim() || ""
    );
    return OrganizationDto.toOrganization(org);
}
