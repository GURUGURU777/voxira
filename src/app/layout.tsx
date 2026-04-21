import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'AFIRMIA — Subconscious Reprogramming with Voice AI',
  description: 'Reprogram your subconscious mind with personalized affirmations, your own voice, and Solfeggio binaural frequencies. 21-day transformation cycles.',
  icons: {
    icon: '/favicon_32.png',
    shortcut: '/favicon_32.png',
    apple: '/afirmia_180.png',
  },
  openGraph: {
    title: 'AFIRMIA — Subconscious Reprogramming',
    description: 'Reprogram your subconscious mind with your own voice and Solfeggio frequencies.',
    url: 'https://afirmia.app',
    siteName: 'AFIRMIA',
    images: [
      {
        url: '/afirmia_512.png',
        width: 512,
        height: 512,
        alt: 'AFIRMIA Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AFIRMIA — Subconscious Reprogramming',
    description: 'Reprogram your subconscious mind with your own voice and Solfeggio frequencies.',
    images: ['/afirmia_512.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0A0A0F] text-white antialiased" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
