import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', style: ['normal', 'italic'] });

export const metadata = {
  title: { default: 'Travelative – Premium Travel Experiences', template: '%s | Travelative' },
  description: "Don't just dream, Travelative. Discover handcrafted luxury travel packages for honeymoons, family adventures, and relaxing escapes across the globe.",
  keywords: ['travel', 'luxury travel', 'honeymoon packages', 'adventure tours', 'family travel', 'Maldives', 'Bali', 'Rajasthan', 'Greece'],
  openGraph: {
    type: 'website',
    siteName: 'Travelative',
    title: 'Travelative – Premium Travel Experiences',
    description: "Don't just dream, Travelative. Discover handcrafted luxury travel packages.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Travelative Premium Travel' }],
  },
  twitter: { card: 'summary_large_image', title: 'Travelative – Premium Travel Experiences', description: "Don't just dream, Travelative." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TravelAgency',
              name: 'Travelative',
              description: "Premium travel agency offering handcrafted luxury tour packages",
              url: 'https://travelative.com',
              telephone: '+91-XXXXXXXXXX',
              address: { '@type': 'PostalAddress', addressCountry: 'IN' },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-white`}>
        <PublicLayoutWrapper>
          {children}
        </PublicLayoutWrapper>
      </body>
    </html>
  );
}
