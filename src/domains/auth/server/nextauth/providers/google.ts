import GoogleProvider from "next-auth/providers/google";
import { ENV } from "@/constants/variables";
// import authService from "@/domains/auth/server/auth.service";

export const google = GoogleProvider({
  clientId: ENV.OAUTH_CLIENT_ID || "",
  clientSecret: ENV.OAUTH_CLIENT_SECRET || "",
});

export async function handleGoogleSignIn() {
  // if (!email) return false;
  // const u = await authService.resolveGoogleUser(email);
  // return !!u;
  return true;
}
