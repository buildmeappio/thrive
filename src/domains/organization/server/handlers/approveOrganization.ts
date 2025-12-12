"use server";

import * as OrganizationsService from "../organizations.service";
import { OrganizationDto } from "../dto/organizations.dto";

export default async function approveOrganization(id: string, userId: string) {
  const org = await OrganizationsService.approveOrganization(id, userId);
  return OrganizationDto.toOrganization(org);
}
