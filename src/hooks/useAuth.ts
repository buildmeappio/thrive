"use client";

import { useSession } from "next-auth/react";
import type { User, UserRole } from "~/types";

export function useAuth() {
  const { data: session, status } = useSession();
  
  const user: User | null = session?.user ? {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string,
    role: session.user.role as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  } : null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  };
}