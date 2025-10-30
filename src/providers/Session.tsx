'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
  session?: Session | null;
}

const SessionProvider = ({ children, session }: SessionProviderProps) => {
  return (
    <NextAuthSessionProvider session={session} basePath='/admin/api/auth' refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </NextAuthSessionProvider>
  );
};

export default SessionProvider;
