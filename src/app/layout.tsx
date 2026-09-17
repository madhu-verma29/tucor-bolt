import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'TUCOR — Trusted Used Cooking Oil Recovery',
  description:
    'TUCOR connects verified UCO sellers with biodiesel manufacturers through a fully managed circular economy marketplace — transparent, trusted, impactful.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className={plusJakartaSans.className}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            classNames: {
              toast:
                'bg-card border border-border text-card-foreground shadow-card-lg rounded-xl font-sans text-sm',
              success: 'border-l-4 border-l-success',
              error: 'border-l-4 border-l-danger',
              warning: 'border-l-4 border-l-warning',
              info: 'border-l-4 border-l-info',
            },
          }}
        />
</body>
    </html>
  );
}