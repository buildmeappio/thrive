import type { NextAuthOptions } from "next-auth";
import { providers } from "./providers";
import { callbacks } from "./callbacks";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", error: "/api/auth/error" },
  providers,
  callbacks,
  secret: process.env.NEXTAUTH_SECRET,
};
