import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoClip AI — ONE LINK. MULTIPLE VIRAL-READY SHORTS.',
  description: 'Turn hours of YouTube content into scroll-stopping Shorts. Let AI find the best moments, edit your clips, and generate dynamic captions automatically.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-background text-text-primary antialiased min-h-screen selection:bg-electric selection:text-white">
        {children}
      </body>
    </html>
  );
}
