import React from 'react';
import Image from 'next/image';
import PropertyFormOptimized from './PropertyFormOptimized';
import { Benefits } from './Benefits';

export default function OptimizedHero() {
  return (
    <section 
      id="property-form" 
      className="relative pt-20 pb-16 px-4 overflow-hidden"
      style={{ contain: 'layout style paint' }}
    >
      {/* Optimized background image with Next.js Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/LandingPageBG2.png"
          alt="Background"
          fill
          priority
          quality={85}
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmX/9k="
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-outline-black">
            Sell Your House Fast for Cash - Get Your Offer Today
          </h1>
          <p className="text-xl text-white mb-8 text-outline-black">
            We buy houses in any condition across California, Nevada, Arizona, and Oregon. Get a fair cash offer in as little as 7 days - no repairs, no fees, and we cover closing costs.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <PropertyFormOptimized />
        </div>
        <Benefits className="mx-auto mt-12" />
      </div>
    </section>
  );
}