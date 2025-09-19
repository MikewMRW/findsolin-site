import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'FindSolin' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindSolin',
    description: 'An immersive, real-world puzzle experience.',
    images: ['/og.jpg'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
