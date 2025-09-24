// domains/auth/actions/consumeInviteAndSetPassword.ts
"use server";
import handlers from "../server/handlers";
import { HttpError } from "@/utils/httpError";

export default async function consumeInviteAndSetPassword(input: {
  token: string;
  password: string;
}) {
  try {
    return await handlers.consumeInviteAndSetPassword(input);
  } catch (e) {
    throw HttpError.fromError(e, "Failed to set password from invite");
  }
}
