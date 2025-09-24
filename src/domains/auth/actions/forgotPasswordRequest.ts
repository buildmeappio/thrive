// domains/auth/actions/forgotPasswordRequest.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function forgotPasswordRequest(email: string) {
  try {
    return await handlers.forgotPasswordRequest(email);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to request password reset");
  }
}
