import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/inter';
import './globals.css';
import { business } from '@/config/business';

export const metadata: Metadata = {
  title: `${business.name} · Cakes, Pastries & Drinks`,
  description: 'Celebration cakes, savoury puffs, pastries and drinks. Browse the menu, design a custom cake and order on WhatsApp.',
  // Demo build: keep it out of search until real business data is verified.
  robots: business.demoMode ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: '#1A1326',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
