"use server";
import * as OrganizationsService from "../organizations.service";
import logger from "@/utils/logger";

export default async function removeSuperAdmin(
  organizationId: string,
  managerId: string,
  removedByAccountId: string,
) {
  try {
    const result = await OrganizationsService.removeSuperAdmin(
      organizationId,
      managerId,
      removedByAccountId,
    );
    return result;
  } catch (error) {
    logger.error("Error removing superadmin:", error);
    throw error;
  }
}
