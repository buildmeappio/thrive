'use client';

import type { ReactNode } from 'react';
import type { Session } from 'next-auth';
import { SessionProvider } from './SessionProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
