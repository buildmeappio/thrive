import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/providers";
import { degular } from "@/lib/fonts";
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
      className={`light ${degular.variable} h-full`}
      suppressHydrationWarning>
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
      <body className={`${degular.className} h-full`} suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>
            <Toaster richColors position="top-center" closeButton />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
