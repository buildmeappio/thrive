import * as OrganizationsService from "../organizations.service";

export default async function getOrganizationById(id: string) {
  return OrganizationsService.getOrganizationById(id);
}
