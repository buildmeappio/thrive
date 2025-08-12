"use client";

import { useSession } from "next-auth/react";
import type { User, UserRole } from "~/types";

export function useAuth() {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        role: (session.user as User).role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  };
}
