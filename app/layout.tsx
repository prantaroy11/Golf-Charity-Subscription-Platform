import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Golf Charity Platform | Play with Purpose. Win for Good.',
  description:
    'A subscription-driven golf platform combining performance tracking, monthly prize draws, and charitable giving. Play for purpose and win for good.',
  keywords: [
    'golf',
    'charity',
    'subscription',
    'prize draw',
    'stableford',
    'giving',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-offwhite antialiased">{children}</body>
    </html>
  );
}
