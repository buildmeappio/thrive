import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/providers";
import { degular, poppins } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "Thrive IME Platform",
  description: "Independent Medical Examiner Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <head>
        {/* Ensure proper mobile viewport to avoid auto zoom-out/scaling */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body
        className={`${degular.variable} ${poppins.variable} font-degular antialiased`}
        suppressHydrationWarning
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
