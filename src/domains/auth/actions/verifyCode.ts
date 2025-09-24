// domains/auth/actions/verifyCode.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function verifyCode(email: string, code: string) {
  try {
    return await handlers.verifyCode({ email, code });
  } catch (e) {
    throw HttpError.fromError(e, "Failed to verify code");
  }
}
