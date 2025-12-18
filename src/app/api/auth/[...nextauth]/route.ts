import NextAuth from "next-auth";
import { authOptions } from "@/domains/auth/server/nextauth/options";

// Mark route as dynamic to prevent static analysis during build
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
