import type { Metadata } from 'next';

// Route-level metadata lives in a layout because page.tsx is a client component
// ('use client'), and Next.js only reads `metadata` from server components.
// Title/description are this page's own H1/intro text (no new copy).
export const metadata: Metadata = {
  title: "Thank You! We've Received Your Information | XVR Buys Houses",
  description: 'One of our property specialists will contact you shortly with your cash offer',
  // Funnel step: keep out of the index but let crawlers follow links.
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
