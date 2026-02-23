"use server";
import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";
import handlers from "../server/handlers";
import logger from "@/utils/logger";

const activateUser = async (managerId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const result = await handlers.activateUser(managerId);

    return {
      success: true,
      managerId: result.id,
    };
  } catch (error) {
    logger.error("Error activating user:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to activate user",
    };
  }
};

export default activateUser;
