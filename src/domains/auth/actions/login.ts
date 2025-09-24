// domains/auth/actions/login.ts
"use server";
import handlers from "../server/handlers";
import { setSession } from "@/domains/auth/server/session";
import { HttpError } from "@/utils/httpError";

export default async function login(email: string, password: string) {
  try {
    const account = await handlers.login({ email, password });
    // assumes setSession stores user/account in cookies
    await setSession({
      userId: account.user.id,
      accountId: account.id,
      roleName: account.role,
      email: account.user.email,
    });
    return account;
  } catch (e) {
    throw HttpError.fromError(e, "Failed to login");
  }
}
