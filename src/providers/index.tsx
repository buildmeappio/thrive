"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { ThemeProvider } from "./ThemeProvider";

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

const Provider = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange>
      <div className="h-full">{children}</div>
    </ThemeProvider>
  );
};

export default Provider;
