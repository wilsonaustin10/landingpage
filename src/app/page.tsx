import type { Metadata } from 'next';
import HomePage from './HomePage';

// Server wrapper so the homepage can export route-level metadata: HomePage is a
// client component ('use client' + ssr:false dynamic imports) and Next.js
// ignores `metadata` exports from client components. Rendering is unchanged.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Page() {
  return <HomePage />;
}
