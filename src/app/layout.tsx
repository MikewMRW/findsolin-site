// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

const TAGLINE =
  'Gritty, mysterious, and immersive. FindSolin turns your love of real cases into a hands-on investigation—blending puzzles, story, and the pulse of the real world.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.findsolin.com'),
  title: {
    default: 'FindSolin',
    template: '%s | FindSolin',
  },
  description: TAGLINE,
  openGraph: {
    title: 'FindSolin',
    description: TAGLINE,
    url: 'https://www.findsolin.com',
    siteName: 'FindSolin',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'FindSolin' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindSolin',
    description: TAGLINE,
    images: ['/og.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
