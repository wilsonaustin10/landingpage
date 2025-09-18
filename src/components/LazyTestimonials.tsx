'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Testimonials = dynamic(() => import('./Testimonials'), {
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse bg-gray-200 rounded-lg w-full max-w-4xl h-48" />
    </div>
  ),
  ssr: true
});

export default function LazyTestimonials() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse bg-gray-200 rounded-lg w-full max-w-4xl h-48" />
      </div>
    }>
      <Testimonials />
    </Suspense>
  );
}