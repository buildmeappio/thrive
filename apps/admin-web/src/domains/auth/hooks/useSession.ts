'use client';
import { authClient } from '@/domains/auth/server/better-auth/client';
import { ClientSession } from '@/domains/auth/server/better-auth/client';

/**
 * Hook to get Better Auth session in client components.
 * Compatible with existing useSession() calls throughout the codebase.
 */
export function useSession(): {
  data: ClientSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
} {
  const { data: session, isPending } = authClient.useSession();

  return {
    data: session,
    status: isPending ? 'loading' : session ? 'authenticated' : 'unauthenticated',
  };
}
