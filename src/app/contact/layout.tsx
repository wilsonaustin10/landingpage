import type { Metadata } from 'next';

// Route-level metadata lives in a layout because page.tsx is a client component
// ('use client'), and Next.js only reads `metadata` from server components.
// Title/description are this page's own H1/intro text (no new copy).
export const metadata: Metadata = {
  title: 'This is the last step! | XVR Buys Houses',
  description: 'This is the last step! Get Your Offer.',
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
