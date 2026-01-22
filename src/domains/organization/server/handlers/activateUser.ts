"use server";
import * as OrganizationsService from "../organizations.service";
import logger from "@/utils/logger";

export default async function activateUser(managerId: string) {
  try {
    const manager = await OrganizationsService.activateUser(managerId);
    return manager;
  } catch (error) {
    logger.error("Error activating user:", error);
    throw error;
  }
}
