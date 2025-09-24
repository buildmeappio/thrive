// domains/auth/actions/adminCreateInvite.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function adminCreateInvite(applicationId: string, ttlHours = 168) {
  try {
    return await handlers.adminCreateInvite(applicationId, ttlHours);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to create invite");
  }
}
