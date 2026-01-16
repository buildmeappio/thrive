"use server";
import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";
import handlers from "../server/handlers";
import logger from "@/utils/logger";

const removeSuperAdmin = async (organizationId: string, managerId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    if (!user.accountId) {
      throw new Error("User account ID not found");
    }

    const result = await handlers.removeSuperAdmin(
      organizationId,
      managerId,
      user.accountId,
    );

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error removing superadmin:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to remove superadmin",
    };
  }
};

export default removeSuperAdmin;
