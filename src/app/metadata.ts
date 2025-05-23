import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your House Fast | Get a Cash Offer Today - XVR Buys Houses',
  description: 'We buy houses in any condition. Submit your address for a fast, no-obligation cash offer. Close in as little as 7 days. No repairs, no fees.',
  keywords: [
    'sell house fast',
    'cash offer house',
    'we buy houses',
    'sell house as is',
    'fast house sale',
    'cash home buyers',
    'no repairs needed',
    'quick house sale',
    'house buying company',
    'sell house cash'
  ],
  authors: [{ name: 'XVR Buys Houses' }],
  creator: 'XVR Buys Houses',
  publisher: 'XVR Buys Houses',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://offer.xvrbuyshouses.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sell Your House Fast | Get a Cash Offer Today',
    description: 'We buy houses in any condition. Submit your address for a fast, no-obligation cash offer. Close in as little as 7 days.',
    url: 'https://offer.xvrbuyshouses.com',
    siteName: 'XVR Buys Houses',
    images: [
      {
        url: '/JR Home Buyer Header Logo.png',
        width: 1200,
        height: 630,
        alt: 'XVR Buys Houses - We Buy Houses Fast',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sell Your House Fast | Get a Cash Offer Today',
    description: 'We buy houses in any condition. Get your fast, no-obligation cash offer today.',
    images: ['/JR Home Buyer Header Logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // You'll need to add this from Google Search Console
  },
};