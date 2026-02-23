"use server";
import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";
import handlers from "../server/handlers";
import logger from "@/utils/logger";

const inviteSuperAdmin = async (
  organizationId: string,
  email: string,
  firstName: string,
  lastName: string,
) => {
  try {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    if (!user.accountId) {
      throw new Error("User account ID not found");
    }

    const invitation = await handlers.inviteSuperAdmin(
      organizationId,
      email,
      firstName,
      lastName,
      user.accountId,
    );

    return {
      success: true,
      invitationId: invitation.id,
    };
  } catch (error) {
    logger.error("Error inviting superadmin:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to invite superadmin",
    };
  }
};

export default inviteSuperAdmin;
