"use server";
import { getCurrentUser } from "@/domains/auth/server/session";
import { OrganizationDto } from "../dto/organizations.dto";
import * as OrganizationsService from "../organizations.service";
import { redirect } from "next/navigation";
import { OrganizationData } from "@/domains/organization/types/OrganizationData";
import logger from "@/utils/logger";

const getOrganizations = async (): Promise<OrganizationData[]> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const orgs = await OrganizationsService.listOrganizations();
  logger.log("organization list", orgs);
  return orgs.map(OrganizationDto.toOrganization);
};

export default getOrganizations;
