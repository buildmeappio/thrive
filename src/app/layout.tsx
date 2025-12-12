import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/providers";
import { ThemeProvider, Toaster } from "@/providers";

export const metadata: Metadata = {
  title: "Thrive — Examiner",
  description: "Independent Medical Examiner onboarding",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`light h-full`}
      style={{ fontFamily: "var(--font-degular)" }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light mode on page load
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
            `,
          }}
        />
      </head>
      <body
        className="h-full font-degular"
        style={{ fontFamily: "var(--font-degular)" }}
        suppressHydrationWarning
      >
        <SessionProvider>
          <ThemeProvider>
            <Toaster richColors position="top-right" closeButton />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
