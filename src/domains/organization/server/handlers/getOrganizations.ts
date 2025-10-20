import { getCurrentUser } from "@/domains/auth/server/session";
import { OrganizationDto } from "../dto/organizations.dto";
import organizationsService from "../organizations.service";
import { redirect } from "next/navigation";
import { OrganizationData } from "@/domains/organization/types/OrganizationData";

const getOrganizations = async (): Promise<OrganizationData[]> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const orgs = await organizationsService.listOrganizations();
  console.log("organization list", orgs)
  return orgs.map(OrganizationDto.toOrganization);
};

export default getOrganizations;
