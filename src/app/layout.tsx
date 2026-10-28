import type { Metadata } from 'next';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { CartProvider } from '@/features/cart';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Golf — Considered goods for everyday',
    template: '%s | Golf',
  },
  description: 'A considered collection of useful goods for everyday life.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only z-50 rounded-md bg-background px-4 py-3 text-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
