"use server";
import * as OrganizationsService from "../organizations.service";
import logger from "@/utils/logger";

export default async function inviteSuperAdmin(
  organizationId: string,
  email: string,
  invitedByAccountId: string,
) {
  try {
    const invitation = await OrganizationsService.inviteSuperAdmin(
      organizationId,
      email,
      invitedByAccountId,
    );
    return invitation;
  } catch (error) {
    logger.error("Error inviting superadmin:", error);
    throw error;
  }
}
