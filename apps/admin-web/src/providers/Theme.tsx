"use client";
import { ThemeProvider as NextThemes } from "next-themes";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemes>
  );
};

export default ThemeProvider;
