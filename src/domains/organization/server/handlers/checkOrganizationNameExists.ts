"use server";
import * as OrganizationsService from "../organizations.service";
import logger from "@/utils/logger";

const checkOrganizationNameExists = async (name: string) => {
  try {
    const exists = await OrganizationsService.checkOrganizationNameExists(name);
    return { exists };
  } catch (error) {
    logger.error("Error checking organization name:", error);
    throw error;
  }
};

export default checkOrganizationNameExists;
