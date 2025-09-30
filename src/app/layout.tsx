import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FindSolin',
    template: '%s · FindSolin',
  },
  description:
    'Gritty. Mysterious. Captivating. FindSolin makes real cases feel within reach—an immersive hunt where you chase leads, connect the dots, and feel the rush.',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
