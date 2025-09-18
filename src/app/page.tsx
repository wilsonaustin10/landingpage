'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Benefits } from '../components/Benefits';

// Lazy load all non-critical components
const PropertyFormOptimized = dynamic(() => import('../components/PropertyFormOptimized'), {
  loading: () => (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-6"></div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
  ssr: false
});

const HowItWorks = dynamic(() => import('../components/HowItWorks').then(mod => ({ default: mod.HowItWorks })), {
  ssr: false,
  loading: () => null
});

const LazyTestimonials = dynamic(() => import('../components/LazyTestimonials'), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const [showBelowFold, setShowBelowFold] = useState(false);

  useEffect(() => {
    // Delay loading below-fold content
    const timer = setTimeout(() => {
      setShowBelowFold(true);
    }, 100);

    // Also trigger on scroll
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowBelowFold(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Critical Hero Section - Inline everything for fastest render */}
      <section 
        id="property-form" 
        className="relative pt-20 pb-16 px-4 overflow-hidden"
        style={{ 
          contain: 'layout style paint',
          minHeight: '600px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Sell Your House Fast for Cash - Get Your Offer Today
            </h1>
            <p className="text-xl text-white mb-8" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              We buy houses in any condition across California, Nevada, Arizona, and Oregon. Get a fair cash offer in as little as 7 days - no repairs, no fees, and we cover closing costs.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <PropertyFormOptimized />
          </div>
          <Benefits className="mx-auto mt-12" />
        </div>
      </section>
      
      {/* Benefits Section - Keep inline for SEO */}
      <section className="py-8 px-4 bg-white" aria-labelledby="benefits-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="benefits-heading" className="text-3xl font-bold text-center mb-6">
            Why Choose XVR Buys Houses?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fast Closing in 7 Days',
                description: 'Close in as little as 7 days or on your timeline - whatever works best for you'
              },
              {
                title: 'No Repairs Needed',
                description: 'We buy houses in any condition - you won\'t need to fix anything or clean up'
              },
              {
                title: 'Zero Fees or Commissions',
                description: 'Save thousands in realtor fees and closing costs - we cover everything'
              }
            ].map((benefit, index) => (
              <article key={index} className="text-center p-6 rounded-lg shadow-lg bg-white">
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Lazy load below-the-fold content only after interaction */}
      {showBelowFold && (
        <>
          <HowItWorks />
          <section id="testimonials" className="py-16 px-4 bg-gray-100" aria-labelledby="testimonials-heading">
            <LazyTestimonials />
          </section>
        </>
      )}
    </main>
  );
}