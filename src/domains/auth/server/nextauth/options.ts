import type { NextAuthOptions } from "next-auth";
import { providers } from "./providers";
import { callbacks } from "./callbacks";

const useSecureCookies = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt", 
    maxAge: 60 * 60 * 8, // 8 hours
    updateAge: 60 * 60, // Update session every hour
  },
  pages: { signIn: "/login", error: "/api/auth/error" },
  providers,
  callbacks,
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/admin",
        secure: useSecureCookies,
      },
    },
  },
  useSecureCookies,
  debug: process.env.NODE_ENV === "development",
};
