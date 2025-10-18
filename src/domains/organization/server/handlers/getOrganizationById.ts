import organizationsService from "../organizations.service";

export default async function getOrganizationById(id: string) {
  return organizationsService.getOrganizationById(id);
}
