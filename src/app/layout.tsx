import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { JotaiProvider } from '@/components/providers/jotai-provider';
import { Toaster } from '@/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GZ Businessplan Generator',
  description:
    'Erstelle deinen Businessplan für den Gründungszuschuss mit KI-Unterstützung',
  keywords: [
    'Businessplan',
    'Gründungszuschuss',
    'Existenzgründung',
    'Startup',
    'Bundesagentur für Arbeit',
  ],
  authors: [{ name: 'GZ Businessplan Generator' }],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://gz-businessplan.de',
    title: 'GZ Businessplan Generator',
    description:
      'Erstelle deinen Businessplan für den Gründungszuschuss mit KI-Unterstützung',
    siteName: 'GZ Businessplan Generator',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: 'your-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Preconnect to Supabase */}
        <link rel="preconnect" href="https://supabase.co" />
        {/* Preconnect to Anthropic API */}
        <link rel="preconnect" href="https://api.anthropic.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <JotaiProvider>
          {children}
          <Toaster />
        </JotaiProvider>
      </body>
    </html>
  );
}
