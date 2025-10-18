import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { FeaturesProvider } from '@/contexts/features-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Church Management App',
  description: 'Hex Soup management and voting system',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/worshiply-logo.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/worshiply-dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/worshiply-logo.png', media: '(prefers-color-scheme: light)' },
      { url: '/worshiply-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <FeaturesProvider>
            {children}
          </FeaturesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
