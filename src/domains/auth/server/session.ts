// domains/auth/server/session.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { authOptions } from "./nextauth/options";
import { AuthUser } from "../types";

/** Raw NextAuth session. Null if unauthenticated. */
export async function getCurrentSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/** Typed current user for server code. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getCurrentSession();
  return session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? null,
        roleName: session.user.roleName,
        accountId: session.user.accountId,
      }
    : null;
}

/** Require a logged-in user or redirect to login. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Start a session.
 * With NextAuth you should initiate login via the client `signIn()` or a form POST to `/api/auth/callback/credentials`.
 * This helper exists for symmetry; it just sends you to the login page with an optional callbackUrl.
 */
export async function setSession(opts?: { callbackUrl?: string }) {
  const cb = opts?.callbackUrl ?? "/";
  redirect(`/login?callbackUrl=${encodeURIComponent(cb)}`);
}

/**
 * Clear session.
 * Server-side, send the browser to NextAuth signout which clears cookies then returns.
 */
export async function clearSession(callbackUrl = "/login") {
  redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
