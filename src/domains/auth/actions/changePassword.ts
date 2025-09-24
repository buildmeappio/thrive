// domains/auth/actions/changePassword.ts
"use server";
import handlers from "../server/handlers";
import { getCurrentUser } from "@/domains/auth/server/session";
import { HttpError } from "@/utils/httpError";

export default async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw HttpError.unauthorized("Unauthorized");
    return await handlers.changePassword(user.id, currentPassword, newPassword);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to change password");
  }
}
