import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Abis Production | Photography & Videography Studio | Addis Ababa',
  description: 'Abis Production - Premier professional photography and videography services for weddings, graduation, studio sessions, corporate events, and pre-wedding shoots. Book online with Telebirr, CBE Birr & Bank Transfer.',
  keywords: [
    'Abis Production',
    'Abis Production Ethiopia',
    'Ethiopian wedding photography',
    'Addis Ababa photography studio',
    'Wedding videography 4K',
    'Graduation photos Addis Ababa',
    'Telebirr payment photography',
    'Studio photo shoot',
  ],
  authors: [{ name: 'Abis Production' }],
  openGraph: {
    title: 'Abis Production | Luxury Photography & Cinema Studio',
    description: 'Timeless visual storytelling, 4K wedding films, and editorial studio photography by Abis Production.',
    url: 'https://abisproduction.com',
    siteName: 'Abis Production Studio',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Abis Production Photography Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'PhotographyBusiness',
    name: 'Abis Production Studio & Cinema',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    '@id': 'https://abisproduction.com',
    url: 'https://abisproduction.com',
    telephone: '+251911234567',
    priceRange: '10000 ETB - 85000 ETB',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bole Atlas, Next to Bole Medhanealem',
      addressLocality: 'Addis Ababa',
      addressCountry: 'ET',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 8.995,
      longitude: 38.788,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:30',
      closes: '19:30',
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="bg-dark-bg text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-gold-500 selection:text-dark-bg">
        <Navbar />
        <main className="flex-grow pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
