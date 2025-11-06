import {
  getServerSession,
  User,
} from "next-auth";
import { authOptions } from "./nextauth/options";
import { NextRequest } from "next/server";
import { HttpError } from "@/utils/httpError";
import { getToken as getTokenNextAuth, JWT } from "next-auth/jwt";
import { cookies } from "next/headers";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Ensure cookies are accessible (this helps in server actions)
    await cookies();
    
    // Use getServerSession - it should work in server actions with Next.js 13+
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    // If there's an error accessing the session, log it and return null
    // This prevents the app from crashing and allows graceful handling
    // Don't log common session errors as they're expected when not authenticated
    if (error instanceof Error && !error.message.includes('session')) {
      console.error("Error getting current user:", error);
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
