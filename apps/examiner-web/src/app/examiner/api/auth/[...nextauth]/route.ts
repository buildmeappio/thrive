import NextAuth from "next-auth";
import { authOptions } from "@/domains/auth/server/nextauth/options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
