import { getServerSession, User } from "next-auth";
import logger from "@/utils/logger";
import { authOptions } from "./nextauth/options";
import { NextRequest } from "next/server";
import { HttpError } from "@/utils/httpError";
import { getToken as getTokenNextAuth, JWT } from "next-auth/jwt";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // getServerSession automatically handles cookies in server components and server actions
    // It should work reliably in Next.js 13+ App Router
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    // Suppress expected errors during build/static generation
    // "Dynamic server usage" errors are expected when getServerSession uses headers()
    // This is normal behavior for authenticated routes that need to be dynamic
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const errorDigest = (error as any).digest;
      const isExpectedError =
        errorMessage.includes("dynamic server usage") ||
        errorMessage.includes("couldn't be rendered statically") ||
        errorMessage.includes("headers") ||
        errorDigest === "DYNAMIC_SERVER_USAGE";

      // Only log unexpected errors (not during build/static generation)
      if (!isExpectedError && process.env.NODE_ENV !== "production") {
        logger.error("Error getting current user:", error);
      }
    }
    return null;
  }
};

export const getToken = async (req: NextRequest): Promise<JWT> => {
  const token = await getTokenNextAuth({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    throw HttpError.unauthorized("Token not found", {
      code: "TOKEN_NOT_FOUND",
    });
  }
  return token;
};
