import { getCurrentUser } from "@/domains/auth/server/session";
import { OrganizationDto } from "../dto/organizations.dto";
import organizationsService from "../organizations.service";
import { redirect } from "next/navigation";

const getOrganizations = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const orgs = await organizationsService.listOrganizations();
  console.log("organization list", orgs)
  return orgs.map(OrganizationDto.toOrganization);
};

export default getOrganizations;
