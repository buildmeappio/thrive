import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/providers";

export const metadata: Metadata = {
  title: "Thrive — Examiner",
  description: "Independent Medical Examiner onboarding",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
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
      <body className="font-degular antialiased">
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
