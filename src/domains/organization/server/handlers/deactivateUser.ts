"use server";
import * as OrganizationsService from "../organizations.service";
import logger from "@/utils/logger";

export default async function deactivateUser(managerId: string) {
  try {
    const manager = await OrganizationsService.deactivateUser(managerId);
    return manager;
  } catch (error) {
    logger.error("Error deactivating user:", error);
    throw error;
  }
}
