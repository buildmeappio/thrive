// domains/auth/actions/forgotPasswordConfirm.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function forgotPasswordConfirm(
  email: string,
  code: string,
  newPassword: string
) {
  try {
    return await handlers.forgotPasswordConfirm(email, code, newPassword);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to confirm password reset");
  }
}
