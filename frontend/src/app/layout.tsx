import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoClip AI — One Link. Multiple Viral-Ready Shorts.',
  description: 'Automatically transform long-form YouTube videos into high-retention, professionally edited 9:16 vertical shorts with face tracking, animated subtitles, and AI viral moment detection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen selection:bg-primary-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
