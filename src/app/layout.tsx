import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.findsolin.com'),
  title: {
    default: 'FindSolin',
    template: '%s · FindSolin',
  },
  description: 'An immersive, real-world puzzle experience.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'FindSolin',
    description: 'An immersive, real-world puzzle experience.',
    url: 'https://www.findsolin.com',
    siteName: 'FindSolin',
    images: [
      { url: '/og.jpg', width: 1200, height: 630, alt: 'FindSolin' },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindSolin',
    description: 'An immersive, real-world puzzle experience.',
    images: ['/og.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
