"use server";

import * as OrganizationsService from "../organizations.service";
import { OrganizationDto } from "../dto/organizations.dto";

export default async function rejectOrganization(
  id: string,
  userId: string,
  reason: string,
) {
  const org = await OrganizationsService.rejectOrganization(
    id,
    userId,
    reason?.trim() || "",
  );
  return OrganizationDto.toOrganization(org);
}
