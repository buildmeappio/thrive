import type { Metadata, Viewport } from 'next';
import { degular, poppins } from '@/shared/lib/fonts';
import { SessionProvider } from '@/shared/components/providers/SessionProvider';
import { ThemeProvider } from '@/shared/components/providers/ThemeProvider';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Thrive - Canadian Compliant Platform',
  description: 'A modern, secure platform built for Canadian privacy compliance.',
  keywords: 'Canadian, privacy, compliance, PIPEDA, secure, platform, medical, examiner',
  authors: [{ name: 'Thrive Team' }],
  robots: 'index, follow',
  icons: {
    icon: '/images/favicon.ico',
  },
  openGraph: {
    title: 'Thrive - Canadian Compliant Platform',
    description: 'A modern, secure platform built for Canadian privacy compliance.',
    type: 'website',
    locale: 'en_CA',
    alternateLocale: 'fr_CA',
  },
  other: {
    'msapplication-TileColor': '#dc2626',
    'theme-color': '#dc2626',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional meta tags for Canadian compliance */}
        <meta name="geo.region" content="CA" />
        <meta name="geo.country" content="Canada" />
        <meta name="language" content="en-CA" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* Accessibility */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${poppins.variable} ${degular.variable}`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="bg-background text-foreground min-h-screen">
              {/* Skip to main content for accessibility */}
              <a
                href="#main-content"
                className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
              >
                Skip to main content
              </a>

              <main id="main-content">{children}</main>

              {/* Canadian compliance footer note */}
              <div className="text-muted-foreground bg-background/80 border-border fixed right-0 bottom-0 rounded-tl-md border-t border-l p-2 text-xs backdrop-blur-sm">
                <span className="flex items-center gap-1">🇨🇦 Canadian Privacy Compliant</span>
              </div>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
